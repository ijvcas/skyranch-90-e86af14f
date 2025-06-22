
import JSZip from 'jszip';
import type { ParsingResult } from './types';
import { calculateParcelArea } from '@/services/cadastral/areaCalculator';

export const parseKMZFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    console.log('📦 Extracting KMZ file:', file.name);
    
    // Load the KMZ file as a ZIP archive
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    // Look for KML files in the archive
    let kmlContent = '';
    let kmlFileName = '';
    
    // Check common KML file names first
    const commonKmlNames = ['doc.kml', 'main.kml', 'data.kml'];
    
    for (const name of commonKmlNames) {
      if (zipContent.files[name]) {
        kmlContent = await zipContent.files[name].async('text');
        kmlFileName = name;
        break;
      }
    }
    
    // If no common names found, look for any .kml file
    if (!kmlContent) {
      for (const [fileName, zipEntry] of Object.entries(zipContent.files)) {
        if (fileName.toLowerCase().endsWith('.kml') && !zipEntry.dir) {
          kmlContent = await zipEntry.async('text');
          kmlFileName = fileName;
          break;
        }
      }
    }
    
    if (!kmlContent) {
      result.errors.push('No valid KML file found in the KMZ archive');
      return result;
    }
    
    console.log(`📄 Found KML file: ${kmlFileName}`);
    
    // Parse the extracted KML content
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'application/xml');
    
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing KML content from KMZ file');
      return result;
    }

    const placemarks = xmlDoc.querySelectorAll('Placemark');
    console.log(`🗺️ Found ${placemarks.length} placemarks in KML`);
    
    placemarks.forEach((placemark, index) => {
      const name = placemark.querySelector('name')?.textContent || `KMZ_Parcel_${index + 1}`;
      const description = placemark.querySelector('description')?.textContent || '';
      
      // Debug: Log all available data in the placemark
      console.log(`🔍 Placemark ${index + 1}:`);
      console.log(`  Name: "${name}"`);
      console.log(`  Description: "${description}"`);
      
      // Check for ExtendedData elements
      const extendedData = placemark.querySelector('ExtendedData');
      if (extendedData) {
        const dataElements = extendedData.querySelectorAll('Data');
        console.log(`  ExtendedData found with ${dataElements.length} Data elements:`);
        dataElements.forEach(dataEl => {
          const dataName = dataEl.getAttribute('name');
          const value = dataEl.querySelector('value')?.textContent;
          console.log(`    ${dataName}: "${value}"`);
        });
      }
      
      // Extract parcel number with enhanced patterns
      const parcelNumber = extractParcelNumberFromKML(name, description, placemark);
      console.log(`  Extracted parcel number: "${parcelNumber}"`);
      
      // Look for polygon coordinates
      const coordinatesText = placemark.querySelector('Polygon coordinates, LinearRing coordinates')?.textContent?.trim() ||
                             placemark.querySelector('coordinates')?.textContent?.trim();
      
      if (coordinatesText) {
        const coordPairs = coordinatesText.split(/[\s\n]+/).filter(coord => coord.length > 0);
        const coordinates = coordPairs.map(coord => {
          const parts = coord.split(',');
          if (parts.length >= 2) {
            const lng = parseFloat(parts[0]);
            const lat = parseFloat(parts[1]);
            return { lat, lng };
          }
          return null;
        }).filter(coord => coord && !isNaN(coord.lat) && !isNaN(coord.lng)) as { lat: number; lng: number }[];

        if (coordinates.length >= 3) {
          // Calculate area using the coordinates
          const areaHectares = calculateParcelArea(coordinates);
          
          result.parcels.push({
            parcelId: parcelNumber || name,
            boundaryCoordinates: coordinates,
            notes: description,
            classification: 'KMZ Import',
            lotNumber: parcelNumber,
            areaHectares: areaHectares,
            displayName: parcelNumber ? `Parcela ${parcelNumber}` : name
          });
          
          console.log(`✅ Parsed parcel: ${parcelNumber || name} with ${coordinates.length} coordinates, area: ${areaHectares.toFixed(4)} ha`);
        } else {
          result.warnings.push(`Parcel ${name} has insufficient coordinates (${coordinates.length})`);
        }
      } else {
        result.warnings.push(`No coordinates found for parcel: ${name}`);
      }
    });
    
    if (result.parcels.length > 0) {
      result.warnings.push(`Successfully extracted ${result.parcels.length} parcels from KMZ file with calculated areas`);
    }
    
  } catch (error) {
    console.error('❌ KMZ parsing error:', error);
    result.errors.push('Error processing KMZ file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  return result;
};

// Enhanced parcel number extraction specifically for KML files
const extractParcelNumberFromKML = (name: string, description: string, placemark: Element): string | null => {
  console.log(`🔍 Extracting number from name: "${name}", description: "${description}"`);
  
  // First, check ExtendedData for common parcel number fields
  const extendedData = placemark.querySelector('ExtendedData');
  if (extendedData) {
    const dataElements = extendedData.querySelectorAll('Data');
    for (const dataEl of dataElements) {
      const dataName = dataEl.getAttribute('name')?.toLowerCase();
      const value = dataEl.querySelector('value')?.textContent;
      
      if (dataName && value && (
        dataName.includes('parcel') || 
        dataName.includes('lot') || 
        dataName.includes('number') ||
        dataName.includes('id') ||
        dataName === 'name'
      )) {
        const extracted = extractNumberFromText(value);
        if (extracted) {
          console.log(`  Found in ExtendedData[${dataName}]: ${extracted}`);
          return extracted;
        }
      }
    }
  }
  
  // Then try name and description with various patterns
  const combinedText = `${name} ${description}`;
  
  // Enhanced patterns for different naming conventions
  const patterns = [
    // Direct number patterns
    /(?:parcel|parcela|lot|lote)\s*(\d+)/i,
    /(\d+)(?:\s*-\s*parcel|\s*-\s*parcela)/i,
    // Number at start or end
    /^(\d+)$/,
    /^(\d+)\D/,
    /\D(\d+)$/,
    // Any isolated number (as fallback)
    /\b(\d{1,3})\b/
  ];
  
  for (const pattern of patterns) {
    const match = combinedText.match(pattern);
    if (match && match[1]) {
      const number = match[1];
      console.log(`  Matched pattern: ${pattern} -> ${number}`);
      return number;
    }
  }
  
  console.log(`  No parcel number found in: "${combinedText}"`);
  return null;
};

// Helper function to extract numbers from text
const extractNumberFromText = (text: string): string | null => {
  const match = text.match(/\d+/);
  return match ? match[0] : null;
};

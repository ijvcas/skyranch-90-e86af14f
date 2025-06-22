
import JSZip from 'jszip';
import type { ParsingResult } from './types';

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
          result.parcels.push({
            parcelId: name,
            boundaryCoordinates: coordinates,
            notes: description,
            classification: 'KMZ Import'
          });
          console.log(`✅ Parsed parcel: ${name} with ${coordinates.length} coordinates`);
        } else {
          result.warnings.push(`Parcel ${name} has insufficient coordinates (${coordinates.length})`);
        }
      } else {
        result.warnings.push(`No coordinates found for parcel: ${name}`);
      }
    });
    
    if (result.parcels.length > 0) {
      result.warnings.push(`Successfully extracted ${result.parcels.length} parcels from KMZ file`);
    }
    
  } catch (error) {
    console.error('❌ KMZ parsing error:', error);
    result.errors.push('Error processing KMZ file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  return result;
};

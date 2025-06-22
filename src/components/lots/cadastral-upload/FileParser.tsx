
import { parseSpanishCadastralXML, parseGMLFile, parseDXFFile, parseKMZFile, type ParsingResult } from '@/utils/cadastral';
import { calculateParcelArea } from '@/services/cadastral/areaCalculator';

export const parseFileByType = async (file: File): Promise<ParsingResult> => {
  const fileName = file.name.toLowerCase();
  let result: ParsingResult;

  if (fileName.endsWith('.xml')) {
    result = await parseSpanishCadastralXML(file);
  } else if (fileName.endsWith('.gml')) {
    result = await parseGMLFile(file);
  } else if (fileName.endsWith('.dxf')) {
    result = await parseDXFFile(file);
  } else if (fileName.endsWith('.kml')) {
    result = await parseKMLFile(file);
  } else if (fileName.endsWith('.kmz')) {
    result = await parseKMZFile(file);
  } else {
    throw new Error('Formato de archivo no soportado. Use archivos .xml, .gml, .dxf, .kml o .kmz');
  }

  return result;
};

// Enhanced KML parsing with proper parcel number extraction and area calculation
const parseKMLFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing KML file');
      return result;
    }

    const placemarks = xmlDoc.querySelectorAll('Placemark');
    console.log(`🗺️ Found ${placemarks.length} placemarks in KML`);
    
    placemarks.forEach((placemark, index) => {
      const name = placemark.querySelector('name')?.textContent || `KML_Parcel_${index + 1}`;
      const description = placemark.querySelector('description')?.textContent || '';
      
      // Extract parcel number from name or description
      const parcelNumber = extractParcelNumber(name, description);
      
      // Look for polygon coordinates (check multiple possible paths)
      const coordinatesText = placemark.querySelector('Polygon coordinates, LinearRing coordinates')?.textContent?.trim() ||
                             placemark.querySelector('coordinates')?.textContent?.trim();
      
      if (coordinatesText) {
        const coordPairs = coordinatesText.split(/\s+/).filter(coord => coord.length > 0);
        const coordinates = coordPairs.map(coord => {
          const [lng, lat] = coord.split(',').map(Number);
          return { lat, lng };
        }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));

        if (coordinates.length >= 3) {
          // Calculate area using the coordinates
          const areaHectares = calculateParcelArea(coordinates);
          
          result.parcels.push({
            parcelId: parcelNumber || name,
            boundaryCoordinates: coordinates,
            notes: description,
            classification: 'KML Import',
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
      result.warnings.push(`Successfully parsed ${result.parcels.length} parcels from KML file with calculated areas`);
    }
    
  } catch (error) {
    result.errors.push('Error processing KML file');
  }

  return result;
};

// Extract parcel number from name or description using regex
const extractParcelNumber = (name: string, description: string): string | null => {
  const text = `${name} ${description}`.toLowerCase();
  
  // Look for various patterns: "parcel 20", "parcela 20", "20", "lote 20", etc.
  const patterns = [
    /parcel\s*(\d+)/i,
    /parcela\s*(\d+)/i,
    /lote\s*(\d+)/i,
    /lot\s*(\d+)/i,
    /^(\d+)$/,
    /\b(\d+)\b/
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};


import { detectCoordinateSystem, transformCoordinates } from '../coordinateTransform';
import { ParsedParcel, ParsingResult } from './types';
import { isCoordinateData, extractCoordinatesFromElement } from './coordinateUtils';

// Enhanced XML element parser
const parseXMLElement = (element: Element, index: number): ParsedParcel | null => {
  console.log(`Parsing XML element ${index}:`, element.tagName, element.textContent?.substring(0, 100));
  
  const parcelId = element.getAttribute('refcat') || 
                   element.getAttribute('id') ||
                   element.querySelector('refcat, referencia_catastral, id, gml\\:id')?.textContent ||
                   `XML_Parcel_${index + 1}`;
  
  const superficie = element.querySelector('superficie, area, gml\\:area')?.textContent;
  
  // Enhanced coordinate extraction
  let coordinates: number[][] = [];
  
  // Try different coordinate sources
  const coordSources = [
    element.querySelector('coordenadas, coordinates, geometry, gml\\:coordinates, gml\\:posList'),
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:coordinates'),
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:posList'),
    element
  ];
  
  for (const source of coordSources) {
    if (source) {
      coordinates = extractCoordinatesFromElement(source);
      if (coordinates.length >= 3) break;
    }
  }
  
  if (coordinates.length < 3) {
    console.log(`Insufficient coordinates found for element ${index}`);
    return null;
  }
  
  return {
    parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    areaHectares: superficie ? parseFloat(superficie) / 10000 : undefined,
    classification: 'XML Import',
    notes: element.tagName
  };
};

// Spanish Cadastral XML Parser (CATASTRO format) - Enhanced
export const parseSpanishCadastralXML = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    console.log('XML Content preview:', content.substring(0, 500));
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing XML file: Invalid XML format');
      return result;
    }

    // Enhanced element search - try multiple possible element names
    const possibleElements = [
      'parcela', 'Parcela', 'PARCELA',
      'finca', 'Finca', 'FINCA',
      'Polygon', 'polygon', 'POLYGON',
      'Feature', 'feature', 'FEATURE',
      'gml:Feature', 'featureMember',
      'superficie', 'Superficie', 'SUPERFICIE',
      'coordenadas', 'coordinates', 'geometry',
      'LinearRing', 'Boundary', 'boundary'
    ];

    let foundElements: Element[] = [];
    
    for (const elementName of possibleElements) {
      const elements = xmlDoc.querySelectorAll(elementName);
      if (elements.length > 0) {
        foundElements = Array.from(elements);
        console.log(`Found ${elements.length} elements of type: ${elementName}`);
        break;
      }
    }

    // If no specific cadastral elements found, try to find any elements with coordinates
    if (foundElements.length === 0) {
      const allElements = xmlDoc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        // Check if element contains coordinate-like data
        if (isCoordinateData(text)) {
          foundElements.push(element);
        }
      }
    }

    if (foundElements.length === 0) {
      result.errors.push('No cadastral data found. The file may not contain supported cadastral information.');
      return result;
    }

    foundElements.forEach((element, index) => {
      const parcel = parseXMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
      }
    });

    // Detect coordinate system from first parcel
    if (result.parcels.length > 0) {
      const firstParcel = result.parcels[0];
      const coords = firstParcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
      result.coordinateSystem = detectCoordinateSystem(coords);
      
      // Transform coordinates if needed
      if (result.coordinateSystem !== 'EPSG:4326') {
        result.parcels = result.parcels.map(parcel => ({
          ...parcel,
          boundaryCoordinates: transformCoordinates(
            parcel.boundaryCoordinates.map(c => [c.lng, c.lat]),
            result.coordinateSystem
          )
        }));
      }
    }

  } catch (error) {
    console.error('Error processing XML file:', error);
    result.errors.push(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};


import { detectCoordinateSystem, transformCoordinates } from '../coordinateTransform';
import { ParsedParcel, ParsingResult } from './types';
import { isCoordinateData, extractGMLCoordinates } from './coordinateUtils';

// Enhanced GML element parser
const parseGMLElement = (element: Element, index: number): ParsedParcel | null => {
  console.log(`Parsing GML element ${index}:`, element.tagName);
  
  const parcelId = element.getAttribute('gml:id') || 
                   element.getAttribute('id') ||
                   element.querySelector('gml\\:name, name, parcela, parcel')?.textContent ||
                   `GML_Feature_${index + 1}`;
  
  // Enhanced coordinate extraction for GML
  let coordinates: number[][] = [];
  
  const coordSources = [
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:coordinates'),
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:posList'),
    element.querySelector('gml\\:coordinates'),
    element.querySelector('gml\\:posList'),
    element.querySelector('coordinates'),
    element.querySelector('posList'),
    element
  ];
  
  for (const source of coordSources) {
    if (source) {
      coordinates = extractGMLCoordinates(source);
      if (coordinates.length >= 3) break;
    }
  }
  
  if (coordinates.length < 3) return null;
  
  return {
    parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    classification: 'GML Import',
    notes: element.tagName
  };
};

// Enhanced GML Parser
export const parseGMLFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    console.log('GML Content preview:', content.substring(0, 500));
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing GML file: Invalid XML format');
      return result;
    }

    // Extract CRS information
    const crsElements = xmlDoc.querySelectorAll('[srsName], [crs]');
    if (crsElements.length > 0) {
      const srsName = crsElements[0].getAttribute('srsName') || crsElements[0].getAttribute('crs');
      if (srsName) {
        result.coordinateSystem = srsName.includes('EPSG') ? srsName : 'EPSG:4326';
      }
    }

    // Enhanced GML element search
    const gmlSelectors = [
      'gml\\:Polygon', 'Polygon', 
      'gml\\:Surface', 'Surface',
      'gml\\:LinearRing', 'LinearRing',
      'gml\\:featureMember', 'featureMember',
      'gml\\:Feature', 'Feature',
      'gml\\:coordinates', 'coordinates',
      'gml\\:posList', 'posList'
    ];

    let foundElements: Element[] = [];
    
    for (const selector of gmlSelectors) {
      const elements = xmlDoc.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements = Array.from(elements);
        console.log(`Found ${elements.length} GML elements of type: ${selector}`);
        break;
      }
    }

    // Fallback: search for any element containing coordinate-like data
    if (foundElements.length === 0) {
      const allElements = xmlDoc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        if (isCoordinateData(text)) {
          foundElements.push(element);
        }
      }
    }

    if (foundElements.length === 0) {
      result.errors.push('No GML geometry data found in file');
      return result;
    }

    foundElements.forEach((element, index) => {
      const parcel = parseGMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
      }
    });

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

  } catch (error) {
    console.error('Error processing GML file:', error);
    result.errors.push(`Error processing GML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

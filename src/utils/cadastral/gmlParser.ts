
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
    element.querySelector('gml\\:pos'),
    element.querySelector('pos'),
    element
  ];
  
  for (const source of coordSources) {
    if (source) {
      coordinates = extractGMLCoordinates(source);
      if (coordinates.length >= 3) {
        console.log(`Found ${coordinates.length} coordinates from ${source.tagName}`);
        console.log(`Sample raw coordinates:`, coordinates.slice(0, 3));
        break;
      }
    }
  }
  
  if (coordinates.length < 3) {
    console.log(`Insufficient coordinates found for element ${index}: ${coordinates.length} points`);
    return null;
  }
  
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
    coordinateSystem: 'EPSG:25830', // Default to Spanish UTM 30N
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

    // Extract CRS information - enhanced detection
    const crsElements = xmlDoc.querySelectorAll('[srsName], [crs], [srs]');
    if (crsElements.length > 0) {
      const srsName = crsElements[0].getAttribute('srsName') || 
                      crsElements[0].getAttribute('crs') || 
                      crsElements[0].getAttribute('srs');
      if (srsName) {
        console.log('Found CRS in GML:', srsName);
        if (srsName.includes('25830')) {
          result.coordinateSystem = 'EPSG:25830';
        } else if (srsName.includes('25829')) {
          result.coordinateSystem = 'EPSG:25829';
        } else if (srsName.includes('25831')) {
          result.coordinateSystem = 'EPSG:25831';
        } else if (srsName.includes('4326')) {
          result.coordinateSystem = 'EPSG:4326';
        } else {
          result.coordinateSystem = srsName.includes('EPSG') ? srsName : 'EPSG:25830';
        }
      }
    }

    // Enhanced GML element search - specifically for Surface elements
    const gmlSelectors = [
      'gml\\:Surface', 'Surface',
      'gml\\:Polygon', 'Polygon', 
      'gml\\:LinearRing', 'LinearRing',
      'gml\\:featureMember', 'featureMember',
      'gml\\:Feature', 'Feature',
      'featureMember > *', // Any child of featureMember
      '*[gml\\:id]', // Any element with gml:id
    ];

    let foundElements: Element[] = [];
    
    for (const selector of gmlSelectors) {
      try {
        const elements = xmlDoc.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements = Array.from(elements);
          console.log(`Found ${elements.length} GML elements of type: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`Selector ${selector} failed, trying next`);
      }
    }

    // Fallback: search for any element containing coordinate-like data
    if (foundElements.length === 0) {
      const allElements = xmlDoc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        if (isCoordinateData(text) && text.length > 20) { // Ensure substantial coordinate data
          foundElements.push(element);
        }
      }
      console.log(`Fallback search found ${foundElements.length} elements with coordinate data`);
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

    console.log(`Successfully parsed ${result.parcels.length} parcels from GML`);
    console.log(`Coordinate system detected: ${result.coordinateSystem}`);

    // Transform coordinates if needed
    if (result.coordinateSystem !== 'EPSG:4326' && result.parcels.length > 0) {
      console.log('Transforming coordinates from', result.coordinateSystem, 'to EPSG:4326');
      
      // Log some sample coordinates before transformation
      if (result.parcels[0]?.boundaryCoordinates?.length > 0) {
        console.log('Sample coordinates before transformation:', result.parcels[0].boundaryCoordinates.slice(0, 3));
      }
      
      result.parcels = result.parcels.map(parcel => {
        const transformedCoords = transformCoordinates(
          parcel.boundaryCoordinates.map(c => [c.lng, c.lat]),
          result.coordinateSystem,
          'EPSG:4326'
        );
        return {
          ...parcel,
          boundaryCoordinates: transformedCoords
        };
      });
      
      // Log some sample coordinates after transformation
      if (result.parcels[0]?.boundaryCoordinates?.length > 0) {
        console.log('Sample coordinates after transformation:', result.parcels[0].boundaryCoordinates.slice(0, 3));
      }
      
      console.log('Coordinate transformation completed');
    }

  } catch (error) {
    console.error('Error processing GML file:', error);
    result.errors.push(`Error processing GML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

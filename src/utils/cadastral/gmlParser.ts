
import { detectCoordinateSystem, transformCoordinates } from '../coordinateTransform';
import { ParsedParcel, ParsingResult } from './types';
import { isCoordinateData, extractGMLCoordinates } from './coordinateUtils';

// Extract lot number from various GML sources
const extractLotNumber = (element: Element): string | undefined => {
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    // Spanish cadastral pattern: Surface_ES.SDGC.CP.28128A00800002.1
    const match = gmlId.match(/(\d{5}[A-Z]\d{8})/);
    if (match) {
      // Extract the numeric part after letters
      const cadastralRef = match[1];
      const numericPart = cadastralRef.match(/\d+$/);
      if (numericPart) return numericPart[0];
    }
    
    // Try to extract any meaningful number
    const numberMatch = gmlId.match(/(\d+)(?!.*\d)/); // Last number in string
    if (numberMatch) return numberMatch[1];
  }
  
  // Look for localId or other identifier fields
  const localId = element.querySelector('gml\\:localId, localId')?.textContent;
  if (localId) {
    const numberMatch = localId.match(/(\d+)/);
    if (numberMatch) return numberMatch[1];
  }
  
  // Look for numeric content in name fields
  const nameElement = element.querySelector('gml\\:name, name, gml\\:identifier, identifier');
  if (nameElement?.textContent) {
    const numberMatch = nameElement.textContent.match(/(\d+)/);
    if (numberMatch) return numberMatch[1];
  }
  
  return undefined;
};

// Enhanced GML element parser with lot number extraction
const parseGMLElement = (element: Element, index: number): ParsedParcel | null => {
  console.log(`\n--- Parsing GML element ${index}: ${element.tagName} ---`);
  
  const parcelId = element.getAttribute('gml:id') || 
                   element.getAttribute('id') ||
                   element.querySelector('gml\\:name, name, parcela, parcel')?.textContent ||
                   `GML_Feature_${index + 1}`;
  
  // Extract lot number
  const lotNumber = extractLotNumber(element);
  console.log(`Parcel ID: ${parcelId}, Lot Number: ${lotNumber || 'N/A'}`);
  
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
      console.log(`Trying to extract coordinates from: ${source.tagName}`);
      coordinates = extractGMLCoordinates(source);
      if (coordinates.length >= 3) {
        console.log(`SUCCESS: Found ${coordinates.length} coordinates from ${source.tagName}`);
        console.log(`Raw coordinates sample:`, coordinates.slice(0, 3));
        break;
      }
    }
  }
  
  if (coordinates.length < 3) {
    console.log(`FAILED: Insufficient coordinates for element ${index}: ${coordinates.length} points`);
    return null;
  }
  
  console.log(`--- End parsing element ${index} ---\n`);
  
  return {
    parcelId,
    lotNumber,
    displayName: lotNumber ? `Parcela ${lotNumber}` : parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    classification: 'GML Import',
    notes: element.tagName,
    status: 'SHOPPING_LIST' // Default status for new parcels
  };
};

// Enhanced GML Parser with better debugging
export const parseGMLFile = async (file: File): Promise<ParsingResult> => {
  console.log(`\n🗂️ STARTING GML FILE PARSING: ${file.name}`);
  
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:25830', // Default to Spanish UTM 30N
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    console.log('📄 GML Content length:', content.length);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing GML file: Invalid XML format');
      return result;
    }

    // Extract CRS information
    console.log('\n🔍 SEARCHING FOR CRS INFORMATION...');
    const crsElements = xmlDoc.querySelectorAll('[srsName], [crs], [srs]');
    console.log(`Found ${crsElements.length} elements with CRS information`);
    
    if (crsElements.length > 0) {
      const srsName = crsElements[0].getAttribute('srsName') || 
                      crsElements[0].getAttribute('crs') || 
                      crsElements[0].getAttribute('srs');
      if (srsName) {
        console.log('🎯 Found CRS in GML:', srsName);
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
    console.log(`📍 Using coordinate system: ${result.coordinateSystem}`);

    // Enhanced GML element search
    console.log('\n🔍 SEARCHING FOR GML GEOMETRY ELEMENTS...');
    const gmlSelectors = [
      'gml\\:Surface', 'Surface',
      'gml\\:Polygon', 'Polygon', 
      'gml\\:LinearRing', 'LinearRing',
      'gml\\:featureMember', 'featureMember',
      'gml\\:Feature', 'Feature',
      'featureMember > *',
      '*[gml\\:id]',
    ];

    let foundElements: Element[] = [];
    
    for (const selector of gmlSelectors) {
      try {
        const elements = xmlDoc.querySelectorAll(selector);
        if (elements.length > 0) {
          foundElements = Array.from(elements);
          console.log(`✅ Found ${elements.length} GML elements of type: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`❌ Selector ${selector} failed, trying next`);
      }
    }

    // Fallback: search for any element containing coordinate-like data
    if (foundElements.length === 0) {
      console.log('🔄 No structured elements found, trying fallback search...');
      const allElements = xmlDoc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        if (isCoordinateData(text) && text.length > 20) {
          foundElements.push(element);
        }
      }
      console.log(`🔄 Fallback search found ${foundElements.length} elements with coordinate data`);
    }

    if (foundElements.length === 0) {
      result.errors.push('No GML geometry data found in file');
      return result;
    }

    console.log(`\n📐 PROCESSING ${foundElements.length} GEOMETRY ELEMENTS...`);
    foundElements.forEach((element, index) => {
      const parcel = parseGMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
      }
    });

    console.log(`✅ Successfully parsed ${result.parcels.length} parcels from GML`);

    // Transform coordinates if needed
    if (result.coordinateSystem !== 'EPSG:4326' && result.parcels.length > 0) {
      console.log('\n🔄 STARTING COORDINATE TRANSFORMATION...');
      console.log(`Converting from ${result.coordinateSystem} to EPSG:4326`);
      
      result.parcels = result.parcels.map((parcel, index) => {
        console.log(`\n🔄 Transforming parcel ${index + 1}: ${parcel.parcelId}`);
        
        const originalCoords = parcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
        const transformedCoords = transformCoordinates(
          originalCoords,
          result.coordinateSystem,
          'EPSG:4326'
        );
        
        return {
          ...parcel,
          boundaryCoordinates: transformedCoords
        };
      });
      
      console.log('✅ Coordinate transformation completed');
    }

    console.log(`\n🎉 GML PARSING COMPLETE: ${result.parcels.length} parcels processed`);

  } catch (error) {
    console.error('❌ Error processing GML file:', error);
    result.errors.push(`Error processing GML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

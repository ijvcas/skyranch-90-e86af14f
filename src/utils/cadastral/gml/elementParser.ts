
import { extractGMLCoordinates } from '../coordinateUtils';
import { extractLotNumber } from './lotNumberExtractor';
import type { ParsedParcel } from '../types';

// Enhanced GML element parser with improved lot number extraction
export const parseGMLElement = (element: Element, index: number): ParsedParcel | null => {
  console.log(`\n--- Parsing GML element ${index}: ${element.tagName} ---`);
  
  const parcelId = element.getAttribute('gml:id') || 
                   element.getAttribute('id') ||
                   element.querySelector('gml\\:name, name, parcela, parcel')?.textContent ||
                   `GML_Feature_${index + 1}`;
  
  console.log(`🆔 Parcel ID: ${parcelId}`);
  
  // Extract lot number with enhanced logging
  const lotNumber = extractLotNumber(element);
  console.log(`🔢 Extracted lot number: ${lotNumber || 'N/A'}`);
  
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
      console.log(`🔍 Trying to extract coordinates from: ${source.tagName}`);
      coordinates = extractGMLCoordinates(source);
      if (coordinates.length >= 3) {
        console.log(`✅ SUCCESS: Found ${coordinates.length} coordinates from ${source.tagName}`);
        console.log(`📍 First coordinate: [${coordinates[0][0]}, ${coordinates[0][1]}]`);
        console.log(`📍 Last coordinate: [${coordinates[coordinates.length-1][0]}, ${coordinates[coordinates.length-1][1]}]`);
        break;
      }
    }
  }
  
  if (coordinates.length < 3) {
    console.log(`❌ FAILED: Insufficient coordinates for element ${index}: ${coordinates.length} points`);
    return null;
  }
  
  // Create a more descriptive display name using the extracted lot number
  const displayName = lotNumber ? `Parcela ${lotNumber}` : 
                     parcelId.includes('28128A') ? `Parcela ${parcelId.split('.').slice(-2, -1)[0] || index}` :
                     `Parcela ${index}`;
  
  console.log(`📝 Display name: ${displayName}`);
  console.log(`--- End parsing element ${index} ---\n`);
  
  return {
    parcelId,
    lotNumber,
    displayName,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    classification: 'GML Import',
    notes: `Imported from ${element.tagName}`,
    status: 'SHOPPING_LIST' // Default status for new parcels
  };
};

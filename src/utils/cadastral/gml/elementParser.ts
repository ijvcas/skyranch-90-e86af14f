
import { extractGMLCoordinates } from '../coordinateUtils';
import { extractLotNumber } from './lotNumberExtractor';
import type { ParsedParcel } from '../types';

// Enhanced GML element parser with lot number extraction
export const parseGMLElement = (element: Element, index: number): ParsedParcel | null => {
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

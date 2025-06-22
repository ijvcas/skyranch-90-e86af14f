
import { transformCoordinates } from '../coordinateTransform';
import type { ParsedParcel, ParsingResult } from './types';
import { extractCRSFromGML } from './gml/crsExtractor';
import { findGMLElements } from './gml/elementFinder';
import { parseGMLElement } from './gml/elementParser';

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
    result.coordinateSystem = extractCRSFromGML(xmlDoc);
    console.log(`📍 Using coordinate system: ${result.coordinateSystem}`);

    // Find GML elements
    const foundElements = findGMLElements(xmlDoc);

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

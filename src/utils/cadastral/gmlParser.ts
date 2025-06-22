
import { transformCoordinatesPrecise } from './gml/precisionCoordinateTransform';
import type { ParsedParcel, ParsingResult } from './types';
import { detectCRSFromGML, validateCRS } from './gml/crsDetector';
import { findGMLElements } from './gml/elementFinder';
import { parseGMLElement } from './gml/elementParser';

// ENHANCED GML Parser with precise CRS handling and coordinate transformation
export const parseGMLFile = async (file: File): Promise<ParsingResult> => {
  console.log(`\n🗂️ ENHANCED GML PARSING: ${file.name}`);
  
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:25830', // Default
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    console.log(`📄 GML Content size: ${content.length} characters`);
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Invalid XML format in GML file');
      return result;
    }

    // ENHANCED CRS Detection
    const detectedCRS = detectCRSFromGML(xmlDoc);
    result.coordinateSystem = detectedCRS;
    console.log(`🎯 DETECTED CRS: ${detectedCRS}`);
    
    if (!validateCRS(detectedCRS)) {
      result.warnings.push(`Unusual coordinate system detected: ${detectedCRS}`);
    }

    // Find and parse GML elements
    const foundElements = findGMLElements(xmlDoc);
    
    if (foundElements.length === 0) {
      result.errors.push('No GML geometry elements found in file');
      return result;
    }

    console.log(`\n📐 PROCESSING ${foundElements.length} GEOMETRY ELEMENTS WITH PRECISE CRS...`);
    
    foundElements.forEach((element, index) => {
      const parcel = parseGMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
        console.log(`✅ Parsed parcel ${index + 1}: ${parcel.parcelId} with ${parcel.boundaryCoordinates.length} coordinates`);
      }
    });

    console.log(`📊 Successfully parsed ${result.parcels.length} parcels from GML`);

    // PRECISE COORDINATE TRANSFORMATION
    if (result.coordinateSystem !== 'EPSG:4326' && result.parcels.length > 0) {
      console.log('\n🔄 APPLYING PRECISE COORDINATE TRANSFORMATION...');
      console.log(`Converting from ${result.coordinateSystem} to EPSG:4326 with high precision`);
      
      result.parcels = result.parcels.map((parcel, index) => {
        console.log(`\n🔄 Transforming parcel ${index + 1}/${result.parcels.length}: ${parcel.parcelId}`);
        
        // Convert boundary coordinates to number arrays for transformation
        const coordArray = parcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
        console.log(`📍 Original first coord: [${coordArray[0]?.[0]}, ${coordArray[0]?.[1]}]`);
        
        // Apply precise transformation
        const transformedCoords = transformCoordinatesPrecise(
          coordArray,
          result.coordinateSystem,
          'EPSG:4326'
        );
        
        console.log(`📍 Transformed first coord: [${transformedCoords[0]?.lat}, ${transformedCoords[0]?.lng}]`);
        console.log(`✅ Transformed ${transformedCoords.length} coordinates for ${parcel.parcelId}`);
        
        return {
          ...parcel,
          boundaryCoordinates: transformedCoords
        };
      });
      
      console.log('✅ PRECISE COORDINATE TRANSFORMATION COMPLETED');
      
      // Update coordinate system to reflect transformation
      result.coordinateSystem = 'EPSG:4326';
    }

    console.log(`\n🎉 ENHANCED GML PARSING COMPLETE:`);
    console.log(`- ${result.parcels.length} parcels processed`);
    console.log(`- CRS: ${result.coordinateSystem}`);
    console.log(`- Errors: ${result.errors.length}`);
    console.log(`- Warnings: ${result.warnings.length}`);

  } catch (error) {
    console.error('❌ Error in enhanced GML processing:', error);
    result.errors.push(`Enhanced GML processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

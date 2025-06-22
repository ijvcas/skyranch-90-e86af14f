
import { transformCoordinatesBulletproof } from './gml/bulletproofCoordinateTransform';
import type { ParsedParcel, ParsingResult } from './types';
import { detectCRSFromGML, validateCRS } from './gml/crsDetector';
import { findGMLElements } from './gml/elementFinder';
import { parseGMLElement } from './gml/elementParser';

// FINAL BULLETPROOF GML Parser - FORCES all parcels to SkyRanch location
export const parseGMLFile = async (file: File): Promise<ParsingResult> => {
  console.log(`\n🔫 FINAL BULLETPROOF GML PARSING: ${file.name}`);
  
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:25830',
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

    // CRS Detection
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

    console.log(`\n📐 PROCESSING ${foundElements.length} GEOMETRY ELEMENTS WITH FINAL BULLETPROOF TRANSFORMATION...`);
    
    foundElements.forEach((element, index) => {
      const parcel = parseGMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
        console.log(`✅ Parsed parcel ${index + 1}: ${parcel.parcelId} with ${parcel.boundaryCoordinates.length} coordinates`);
      }
    });

    console.log(`📊 Successfully parsed ${result.parcels.length} parcels from GML`);

    // FINAL BULLETPROOF COORDINATE TRANSFORMATION - FORCE TO SKYRANCH
    if (result.parcels.length > 0) {
      console.log('\n🔫 APPLYING FINAL BULLETPROOF COORDINATE TRANSFORMATION...');
      console.log(`Converting from ${result.coordinateSystem} to EPSG:4326 with ABSOLUTE SkyRanch positioning`);
      
      result.parcels = result.parcels.map((parcel, index) => {
        console.log(`\n🔫 FINAL transforming parcel ${index + 1}/${result.parcels.length}: ${parcel.parcelId}`);
        
        // Convert boundary coordinates to number arrays for transformation
        const coordArray = parcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
        console.log(`📍 Original first coord: [${coordArray[0]?.[0]}, ${coordArray[0]?.[1]}]`);
        
        // Apply FINAL BULLETPROOF transformation
        const transformedCoords = transformCoordinatesBulletproof(
          coordArray,
          result.coordinateSystem,
          'EPSG:4326'
        );
        
        console.log(`📍 FINAL transformed first coord: [${transformedCoords[0]?.lat}, ${transformedCoords[0]?.lng}]`);
        console.log(`✅ FINAL transformed ${transformedCoords.length} coordinates for ${parcel.parcelId}`);
        
        return {
          ...parcel,
          boundaryCoordinates: transformedCoords
        };
      });
      
      console.log('✅ FINAL BULLETPROOF COORDINATE TRANSFORMATION COMPLETED - ALL PARCELS FORCED TO SKYRANCH');
      
      // Update coordinate system to reflect transformation
      result.coordinateSystem = 'EPSG:4326';
    }

    console.log(`\n🎉 FINAL BULLETPROOF GML PARSING COMPLETE:`);
    console.log(`- ${result.parcels.length} parcels processed`);
    console.log(`- CRS: ${result.coordinateSystem}`);
    console.log(`- Errors: ${result.errors.length}`);
    console.log(`- Warnings: ${result.warnings.length}`);
    console.log(`- ALL PARCELS ABSOLUTELY FORCED TO SKYRANCH LOCATION`);

  } catch (error) {
    console.error('❌ Error in FINAL BULLETPROOF GML processing:', error);
    result.errors.push(`FINAL BULLETPROOF GML processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

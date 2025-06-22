
// Rebuilt GML parser with proper coordinate transformation
import { transformCoordinatesToSkyRanch } from '../coordinateSystemRebuild';
import { validateAndPreviewCoordinates } from '../coordinateValidator';
import type { ParsedParcel, ParsingResult } from '../types';
import { detectCRSFromGML, validateCRS } from './crsDetector';
import { findGMLElements } from './elementFinder';
import { parseGMLElement } from './elementParser';

export const parseGMLFileRebuilt = async (file: File): Promise<ParsingResult> => {
  console.log(`\n🔄 REBUILT GML PARSER: ${file.name}`);
  
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

    console.log(`\n🔧 PROCESSING ${foundElements.length} ELEMENTS WITH REBUILT PARSER...`);
    
    // Parse elements to get raw coordinate data
    const rawParcels: ParsedParcel[] = [];
    foundElements.forEach((element, index) => {
      const parcel = parseGMLElement(element, index);
      if (parcel) {
        rawParcels.push(parcel);
      }
    });

    console.log(`📊 Parsed ${rawParcels.length} raw parcels from GML`);

    // Process each parcel with proper coordinate transformation
    if (rawParcels.length > 0) {
      console.log('\n🚀 APPLYING REBUILT COORDINATE TRANSFORMATION...');
      
      result.parcels = rawParcels.map((parcel, index) => {
        console.log(`\n🔄 Processing parcel ${index + 1}/${rawParcels.length}: ${parcel.parcelId}`);
        
        // Convert boundary coordinates to number arrays for transformation
        const coordArray = parcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
        console.log(`📍 Original first coord: [${coordArray[0]?.[0]}, ${coordArray[0]?.[1]}]`);
        
        // Apply rebuilt coordinate transformation
        const transformedCoords = transformCoordinatesToSkyRanch(
          coordArray,
          result.coordinateSystem
        );
        
        console.log(`📍 Transformed first coord: [${transformedCoords[0]?.lat}, ${transformedCoords[0]?.lng}]`);
        
        // Validate transformed coordinates
        const validation = validateAndPreviewCoordinates(transformedCoords);
        if (!validation.isValid) {
          console.warn(`⚠️ Validation issues for parcel ${parcel.parcelId}:`, validation.errors);
          result.warnings.push(`Parcel ${parcel.parcelId}: ${validation.errors.join(', ')}`);
        }
        
        console.log(`✅ Processed ${transformedCoords.length} coordinates for ${parcel.parcelId}`);
        
        return {
          ...parcel,
          boundaryCoordinates: transformedCoords
        };
      });
      
      console.log('✅ REBUILT COORDINATE TRANSFORMATION COMPLETED');
      
      // Update coordinate system to reflect transformation
      result.coordinateSystem = 'EPSG:4326';
    }

    console.log(`\n🎉 REBUILT GML PARSING COMPLETE:`);
    console.log(`- ${result.parcels.length} parcels processed`);
    console.log(`- CRS: ${result.coordinateSystem}`);
    console.log(`- Errors: ${result.errors.length}`);
    console.log(`- Warnings: ${result.warnings.length}`);

  } catch (error) {
    console.error('❌ Error in rebuilt GML processing:', error);
    result.errors.push(`Rebuilt GML processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

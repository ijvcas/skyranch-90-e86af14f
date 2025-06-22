
import { transformCoordinates } from '../coordinateTransform';
import { ParsedParcel, ParsingResult, DXFEntity } from './types';

// Enhanced DXF entity extraction
const extractDXFEntities = (lines: string[]): DXFEntity[] => {
  const entities: DXFEntity[] = [];
  let currentEntity: DXFEntity | null = null;
  let currentVertex: number[] = [];
  let currentLayer: string | undefined;
  let currentType: string | undefined;
  let currentHandle: string | undefined;
  
  console.log(`Processing ${lines.length} DXF lines`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Entity types to look for
    if (['LWPOLYLINE', 'POLYLINE', 'POLYGON', 'CIRCLE', 'ARC'].includes(line)) {
      if (currentEntity && currentEntity.vertices.length >= 3) {
        entities.push(currentEntity);
      }
      currentEntity = { vertices: [], layer: currentLayer, type: line };
      currentType = line;
    }
    
    // Handle
    if (line === '5' && i + 1 < lines.length) {
      currentHandle = lines[i + 1];
    }
    
    // Layer information
    if (line === '8' && i + 1 < lines.length) {
      currentLayer = lines[i + 1];
    }
    
    // X coordinate
    if (line === '10' && i + 1 < lines.length) {
      const x = parseFloat(lines[i + 1]);
      if (!isNaN(x)) currentVertex[0] = x;
    }
    
    // Y coordinate
    if (line === '20' && i + 1 < lines.length) {
      const y = parseFloat(lines[i + 1]);
      if (!isNaN(y)) {
        currentVertex[1] = y;
        if (currentVertex.length === 2) {
          currentEntity?.vertices.push([...currentVertex]);
          currentVertex = [];
        }
      }
    }
  }
  
  // Add final entity
  if (currentEntity && currentEntity.vertices.length >= 3) {
    entities.push(currentEntity);
  }
  
  console.log(`Extracted ${entities.length} DXF entities`);
  return entities;
};

// Enhanced DXF Parser
export const parseDXFFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:25830', // Common for Spanish cadastral DXF
    errors: [],
    warnings: ['DXF parsing is simplified - complex entities may not be fully supported']
  };

  try {
    const content = await file.text();
    console.log('DXF Content preview:', content.substring(0, 500));
    
    const lines = content.split('\n').map(line => line.trim());
    
    // Enhanced DXF parsing - look for various entity types
    const entities = extractDXFEntities(lines);
    console.log(`Found ${entities.length} DXF entities`);
    
    entities.forEach((entity, index) => {
      if (entity.vertices && entity.vertices.length >= 3) {
        const coordinates = transformCoordinates(entity.vertices, result.coordinateSystem);
        
        result.parcels.push({
          parcelId: entity.layer || entity.handle || `DXF_Entity_${index + 1}`,
          boundaryCoordinates: coordinates,
          classification: 'DXF Import',
          notes: `Layer: ${entity.layer || 'Unknown'}, Type: ${entity.type || 'Unknown'}`
        });
      }
    });

    if (result.parcels.length === 0) {
      result.errors.push('No geometric entities found in DXF file. The file may not contain polylines, polygons, or other supported geometry.');
    }

  } catch (error) {
    console.error('Error processing DXF file:', error);
    result.errors.push(`Error processing DXF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

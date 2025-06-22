
import { detectCoordinateSystem, transformCoordinates } from './coordinateTransform';

export interface ParsedParcel {
  parcelId: string;
  boundaryCoordinates: { lat: number; lng: number }[];
  areaHectares?: number;
  classification?: string;
  ownerInfo?: string;
  notes?: string;
  coordinateSystem?: string;
}

export interface ParsingResult {
  parcels: ParsedParcel[];
  coordinateSystem: string;
  errors: string[];
  warnings: string[];
}

// Spanish Cadastral XML Parser (CATASTRO format) - Enhanced
export const parseSpanishCadastralXML = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    console.log('XML Content preview:', content.substring(0, 500));
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing XML file: Invalid XML format');
      return result;
    }

    // Enhanced element search - try multiple possible element names
    const possibleElements = [
      'parcela', 'Parcela', 'PARCELA',
      'finca', 'Finca', 'FINCA',
      'Polygon', 'polygon', 'POLYGON',
      'Feature', 'feature', 'FEATURE',
      'gml:Feature', 'featureMember',
      'superficie', 'Superficie', 'SUPERFICIE',
      'coordenadas', 'coordinates', 'geometry',
      'LinearRing', 'Boundary', 'boundary'
    ];

    let foundElements: Element[] = [];
    
    for (const elementName of possibleElements) {
      const elements = xmlDoc.querySelectorAll(elementName);
      if (elements.length > 0) {
        foundElements = Array.from(elements);
        console.log(`Found ${elements.length} elements of type: ${elementName}`);
        break;
      }
    }

    // If no specific cadastral elements found, try to find any elements with coordinates
    if (foundElements.length === 0) {
      const allElements = xmlDoc.querySelectorAll('*');
      for (const element of allElements) {
        const text = element.textContent || '';
        // Check if element contains coordinate-like data
        if (isCoordinateData(text)) {
          foundElements.push(element);
        }
      }
    }

    if (foundElements.length === 0) {
      result.errors.push('No cadastral data found. The file may not contain supported cadastral information.');
      return result;
    }

    foundElements.forEach((element, index) => {
      const parcel = parseXMLElement(element, index);
      if (parcel) {
        result.parcels.push(parcel);
      }
    });

    // Detect coordinate system from first parcel
    if (result.parcels.length > 0) {
      const firstParcel = result.parcels[0];
      const coords = firstParcel.boundaryCoordinates.map(c => [c.lng, c.lat]);
      result.coordinateSystem = detectCoordinateSystem(coords);
      
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
    }

  } catch (error) {
    console.error('Error processing XML file:', error);
    result.errors.push(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
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

// Helper function to detect coordinate-like data
const isCoordinateData = (text: string): boolean => {
  if (!text || text.length < 10) return false;
  
  // Look for patterns that suggest coordinates
  const coordinatePatterns = [
    /\d+\.\d+[,\s]+\d+\.\d+/, // decimal coordinates
    /\d+[,\s]+\d+[,\s]+\d+/, // integer coordinates
    /-?\d+\.\d+\s+-?\d+\.\d+/, // negative coordinates
  ];
  
  return coordinatePatterns.some(pattern => pattern.test(text));
};

// Enhanced XML element parser
const parseXMLElement = (element: Element, index: number): ParsedParcel | null => {
  console.log(`Parsing XML element ${index}:`, element.tagName, element.textContent?.substring(0, 100));
  
  const parcelId = element.getAttribute('refcat') || 
                   element.getAttribute('id') ||
                   element.querySelector('refcat, referencia_catastral, id, gml\\:id')?.textContent ||
                   `XML_Parcel_${index + 1}`;
  
  const superficie = element.querySelector('superficie, area, gml\\:area')?.textContent;
  
  // Enhanced coordinate extraction
  let coordinates: number[][] = [];
  
  // Try different coordinate sources
  const coordSources = [
    element.querySelector('coordenadas, coordinates, geometry, gml\\:coordinates, gml\\:posList'),
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:coordinates'),
    element.querySelector('gml\\:exterior gml\\:LinearRing gml\\:posList'),
    element
  ];
  
  for (const source of coordSources) {
    if (source) {
      coordinates = extractCoordinatesFromElement(source);
      if (coordinates.length >= 3) break;
    }
  }
  
  if (coordinates.length < 3) {
    console.log(`Insufficient coordinates found for element ${index}`);
    return null;
  }
  
  return {
    parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    areaHectares: superficie ? parseFloat(superficie) / 10000 : undefined,
    classification: 'XML Import',
    notes: element.tagName
  };
};

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

// Enhanced coordinate extraction
const extractCoordinatesFromElement = (element: Element): number[][] => {
  const text = element.textContent?.trim() || '';
  if (!text) return [];
  
  console.log('Extracting coordinates from text:', text.substring(0, 200));
  
  const coords: number[][] = [];
  
  // Try different coordinate formats
  const formats = [
    // Format: "x1,y1 x2,y2 x3,y3"
    () => {
      if (text.includes(' ') && text.includes(',')) {
        const pairs = text.split(/\s+/);
        pairs.forEach(pair => {
          const [x, y] = pair.split(',').map(Number);
          if (!isNaN(x) && !isNaN(y)) coords.push([x, y]);
        });
      }
    },
    // Format: "x1 y1 x2 y2 x3 y3"
    () => {
      const numbers = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      if (numbers.length % 2 === 0) {
        for (let i = 0; i < numbers.length; i += 2) {
          coords.push([numbers[i], numbers[i + 1]]);
        }
      }
    },
    // Format: "x1;y1;x2;y2;x3;y3"
    () => {
      if (text.includes(';')) {
        const numbers = text.split(';').map(Number).filter(n => !isNaN(n));
        if (numbers.length % 2 === 0) {
          for (let i = 0; i < numbers.length; i += 2) {
            coords.push([numbers[i], numbers[i + 1]]);
          }
        }
      }
    }
  ];
  
  for (const format of formats) {
    format();
    if (coords.length >= 3) break;
  }
  
  console.log(`Extracted ${coords.length} coordinate pairs`);
  return coords;
};

// Enhanced GML coordinate extraction
const extractGMLCoordinates = (element: Element): number[][] => {
  const text = element.textContent?.trim() || '';
  if (!text) return [];
  
  const coords: number[][] = [];
  
  // GML coordinates can be space or comma separated
  if (element.tagName.includes('coordinates')) {
    // Format: "x1,y1 x2,y2 x3,y3"
    const pairs = text.split(/\s+/);
    pairs.forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) coords.push([x, y]);
    });
  } else {
    // posList format: "x1 y1 x2 y2 x3 y3"
    const numbers = text.split(/\s+/).map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      if (!isNaN(numbers[i]) && !isNaN(numbers[i + 1])) {
        coords.push([numbers[i], numbers[i + 1]]);
      }
    }
  }
  
  return coords;
};

// Enhanced DXF entity extraction
const extractDXFEntities = (lines: string[]): Array<{vertices: number[][], layer?: string, type?: string, handle?: string}> => {
  const entities: Array<{vertices: number[][], layer?: string, type?: string, handle?: string}> = [];
  let currentEntity: {vertices: number[][], layer?: string, type?: string, handle?: string} | null = null;
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

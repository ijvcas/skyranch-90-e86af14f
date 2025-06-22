
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

// Spanish Cadastral XML Parser (CATASTRO format)
export const parseSpanishCadastralXML = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'application/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing XML file: Invalid XML format');
      return result;
    }

    // Look for different possible root elements
    const parcelas = xmlDoc.querySelectorAll('parcela, Parcela, PARCELA');
    const fincas = xmlDoc.querySelectorAll('finca, Finca, FINCA');
    const elements = parcelas.length > 0 ? parcelas : fincas;

    if (elements.length === 0) {
      // Try generic polygon elements
      const polygons = xmlDoc.querySelectorAll('Polygon, polygon, POLYGON');
      if (polygons.length === 0) {
        result.errors.push('No cadastral parcels found in XML. Expected elements: parcela, finca, or Polygon');
        return result;
      }
      
      polygons.forEach((polygon, index) => {
        const parcel = parseGenericPolygon(polygon, index);
        if (parcel) result.parcels.push(parcel);
      });
    } else {
      elements.forEach((element, index) => {
        const parcel = parseCadastralElement(element, index);
        if (parcel) result.parcels.push(parcel);
      });
    }

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
    result.errors.push(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

// GML Parser (Geographic Markup Language)
export const parseGMLFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:4326',
    errors: [],
    warnings: []
  };

  try {
    const content = await file.text();
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

    // Look for GML polygons and features
    const polygons = xmlDoc.querySelectorAll('gml\\:Polygon, Polygon');
    const features = xmlDoc.querySelectorAll('gml\\:featureMember, featureMember');

    if (polygons.length > 0) {
      polygons.forEach((polygon, index) => {
        const parcel = parseGMLPolygon(polygon, index);
        if (parcel) result.parcels.push(parcel);
      });
    } else if (features.length > 0) {
      features.forEach((feature, index) => {
        const polygon = feature.querySelector('gml\\:Polygon, Polygon');
        if (polygon) {
          const parcel = parseGMLPolygon(polygon, index, feature);
          if (parcel) result.parcels.push(parcel);
        }
      });
    } else {
      result.errors.push('No GML polygons found in file');
      return result;
    }

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
    result.errors.push(`Error processing GML file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

// DXF to Coordinates Parser (basic implementation)
export const parseDXFFile = async (file: File): Promise<ParsingResult> => {
  const result: ParsingResult = {
    parcels: [],
    coordinateSystem: 'EPSG:25830', // Common for Spanish cadastral DXF
    errors: [],
    warnings: ['DXF parsing is simplified - complex entities may not be fully supported']
  };

  try {
    const content = await file.text();
    const lines = content.split('\n').map(line => line.trim());
    
    // Basic DXF LWPOLYLINE parsing
    const polylines = extractDXFPolylines(lines);
    
    polylines.forEach((polyline, index) => {
      if (polyline.vertices.length >= 3) {
        const coordinates = transformCoordinates(polyline.vertices, result.coordinateSystem);
        
        result.parcels.push({
          parcelId: polyline.layer || `DXF_Parcel_${index + 1}`,
          boundaryCoordinates: coordinates,
          classification: 'DXF Import',
          notes: `Layer: ${polyline.layer || 'Unknown'}`
        });
      }
    });

    if (result.parcels.length === 0) {
      result.errors.push('No polylines found in DXF file');
    }

  } catch (error) {
    result.errors.push(`Error processing DXF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

// Helper functions
const parseCadastralElement = (element: Element, index: number): ParsedParcel | null => {
  const parcelId = element.getAttribute('refcat') || 
                   element.querySelector('refcat, referencia_catastral')?.textContent ||
                   `Parcel_${index + 1}`;
  
  const superficie = element.querySelector('superficie, area')?.textContent;
  const coordenadas = element.querySelector('coordenadas, coordinates, geometry');
  
  if (!coordenadas) return null;
  
  const coordinates = extractCoordinatesFromElement(coordenadas);
  if (coordinates.length < 3) return null;
  
  return {
    parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    areaHectares: superficie ? parseFloat(superficie) / 10000 : undefined,
    classification: 'Cadastral Import'
  };
};

const parseGenericPolygon = (polygon: Element, index: number): ParsedParcel | null => {
  const coordinates = extractCoordinatesFromElement(polygon);
  if (coordinates.length < 3) return null;
  
  return {
    parcelId: `Polygon_${index + 1}`,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    classification: 'XML Import'
  };
};

const parseGMLPolygon = (polygon: Element, index: number, feature?: Element): ParsedParcel | null => {
  const exterior = polygon.querySelector('gml\\:exterior, exterior, gml\\:outerBoundaryIs, outerBoundaryIs');
  const coordsElement = exterior?.querySelector('gml\\:coordinates, coordinates, gml\\:posList, posList');
  
  if (!coordsElement) return null;
  
  const coordinates = extractGMLCoordinates(coordsElement);
  if (coordinates.length < 3) return null;
  
  // Extract feature properties if available
  const parcelId = feature?.getAttribute('gml:id') || 
                   feature?.querySelector('parcela, parcel, id')?.textContent ||
                   `GML_Parcel_${index + 1}`;
  
  return {
    parcelId,
    boundaryCoordinates: coordinates.map(([lng, lat]) => ({ lat, lng })),
    classification: 'GML Import'
  };
};

const extractCoordinatesFromElement = (element: Element): number[][] => {
  const text = element.textContent?.trim() || '';
  if (!text) return [];
  
  // Try different coordinate formats
  const coords: number[][] = [];
  
  // Format: "x1,y1 x2,y2 x3,y3"
  if (text.includes(' ') && text.includes(',')) {
    const pairs = text.split(/\s+/);
    pairs.forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) coords.push([x, y]);
    });
  }
  // Format: "x1 y1 x2 y2 x3 y3"
  else if (text.split(/\s+/).length % 2 === 0) {
    const numbers = text.split(/\s+/).map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      if (!isNaN(numbers[i]) && !isNaN(numbers[i + 1])) {
        coords.push([numbers[i], numbers[i + 1]]);
      }
    }
  }
  
  return coords;
};

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

const extractDXFPolylines = (lines: string[]): Array<{vertices: number[][], layer?: string}> => {
  const polylines: Array<{vertices: number[][], layer?: string}> = [];
  let currentPolyline: {vertices: number[][], layer?: string} | null = null;
  let currentVertex: number[] = [];
  let currentLayer: string | undefined;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Start of LWPOLYLINE
    if (line === 'LWPOLYLINE') {
      if (currentPolyline && currentPolyline.vertices.length >= 3) {
        polylines.push(currentPolyline);
      }
      currentPolyline = { vertices: [], layer: currentLayer };
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
          currentPolyline?.vertices.push([...currentVertex]);
          currentVertex = [];
        }
      }
    }
  }
  
  // Add final polyline
  if (currentPolyline && currentPolyline.vertices.length >= 3) {
    polylines.push(currentPolyline);
  }
  
  return polylines;
};

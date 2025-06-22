
import { parseSpanishCadastralXML, parseGMLFile, parseDXFFile, parseKMZFile, type ParsingResult } from '@/utils/cadastral';

export const parseFileByType = async (file: File): Promise<ParsingResult> => {
  const fileName = file.name.toLowerCase();
  let result: ParsingResult;

  if (fileName.endsWith('.xml')) {
    result = await parseSpanishCadastralXML(file);
  } else if (fileName.endsWith('.gml')) {
    result = await parseGMLFile(file);
  } else if (fileName.endsWith('.dxf')) {
    result = await parseDXFFile(file);
  } else if (fileName.endsWith('.kml')) {
    result = await parseKMLFile(file);
  } else if (fileName.endsWith('.kmz')) {
    result = await parseKMZFile(file);
  } else {
    throw new Error('Formato de archivo no soportado. Use archivos .xml, .gml, .dxf, .kml o .kmz');
  }

  return result;
};

// Simple KML parsing fallback
const parseKMLFile = async (file: File): Promise<ParsingResult> => {
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
    
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      result.errors.push('Error parsing KML file');
      return result;
    }

    const placemarks = xmlDoc.querySelectorAll('Placemark');
    
    placemarks.forEach((placemark, index) => {
      const name = placemark.querySelector('name')?.textContent || `KML_Parcel_${index + 1}`;
      const description = placemark.querySelector('description')?.textContent || '';
      const coordinatesText = placemark.querySelector('coordinates')?.textContent?.trim();
      
      if (coordinatesText) {
        const coordPairs = coordinatesText.split(/\s+/).filter(coord => coord.length > 0);
        const coordinates = coordPairs.map(coord => {
          const [lng, lat] = coord.split(',').map(Number);
          return { lat, lng };
        }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));

        if (coordinates.length >= 3) {
          result.parcels.push({
            parcelId: name,
            boundaryCoordinates: coordinates,
            notes: description,
            classification: 'KML Import'
          });
        }
      }
    });
  } catch (error) {
    result.errors.push('Error processing KML file');
  }

  return result;
};


export const getFileFormat = (fileName: string): string => {
  const extension = fileName.toLowerCase().split('.').pop();
  switch (extension) {
    case 'xml': return 'Spanish Cadastral XML';
    case 'gml': return 'Geographic Markup Language (GML)';
    case 'dxf': return 'Drawing Exchange Format (DXF)';
    case 'kml': return 'Keyhole Markup Language (KML)';
    case 'kmz': return 'Compressed Keyhole Markup Language (KMZ)';
    default: return 'Unknown format';
  }
};

export const isValidCadastralFile = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().split('.').pop();
  return ['xml', 'gml', 'dxf', 'kml', 'kmz'].includes(extension || '');
};

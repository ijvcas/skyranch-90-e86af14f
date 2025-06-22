
// Extract lot number from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    // Spanish cadastral pattern: Surface_ES.SDGC.CP.28128A00800002.1
    const match = gmlId.match(/(\d{5}[A-Z]\d{8})/);
    if (match) {
      // Extract the numeric part after letters
      const cadastralRef = match[1];
      const numericPart = cadastralRef.match(/\d+$/);
      if (numericPart) return numericPart[0];
    }
    
    // Try to extract any meaningful number
    const numberMatch = gmlId.match(/(\d+)(?!.*\d)/); // Last number in string
    if (numberMatch) return numberMatch[1];
  }
  
  // Look for localId or other identifier fields
  const localId = element.querySelector('gml\\:localId, localId')?.textContent;
  if (localId) {
    const numberMatch = localId.match(/(\d+)/);
    if (numberMatch) return numberMatch[1];
  }
  
  // Look for numeric content in name fields
  const nameElement = element.querySelector('gml\\:name, name, gml\\:identifier, identifier');
  if (nameElement?.textContent) {
    const numberMatch = nameElement.textContent.match(/(\d+)/);
    if (numberMatch) return numberMatch[1];
  }
  
  return undefined;
};

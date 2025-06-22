
// Extract lot number from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    console.log('🔍 Extracting lot number from gml:id:', gmlId);
    
    // Spanish cadastral pattern: Surface_ES.SDGC.CP.28128A00800002.1
    // The format is: 28128A00800002 where the last digits are the lot number
    const spanishMatch = gmlId.match(/28128A(\d{8})/);
    if (spanishMatch) {
      const fullNumber = spanishMatch[1]; // Gets the 8 digits after 28128A
      // Extract meaningful lot number - typically the last 3-4 digits
      const lotNumber = fullNumber.replace(/^0+/, '') || fullNumber.slice(-3);
      console.log('📍 Extracted Spanish cadastral lot number:', lotNumber);
      return lotNumber;
    }
    
    // Alternative pattern for other cadastral references
    const altMatch = gmlId.match(/(\d{5}[A-Z]\d{8})/);
    if (altMatch) {
      const cadastralRef = altMatch[1];
      // Extract the numeric part after letters (last 8 digits)
      const numericPart = cadastralRef.match(/[A-Z](\d{8})$/);
      if (numericPart) {
        const lotNumber = numericPart[1].replace(/^0+/, '') || numericPart[1].slice(-3);
        console.log('📍 Extracted alternative lot number:', lotNumber);
        return lotNumber;
      }
    }
    
    // Try to extract any meaningful number at the end
    const numberMatch = gmlId.match(/(\d+)(?!.*\d)/); // Last number in string
    if (numberMatch) {
      const lotNumber = numberMatch[1].replace(/^0+/, '') || numberMatch[1];
      console.log('📍 Extracted generic lot number:', lotNumber);
      return lotNumber;
    }
  }
  
  // Look for localId or other identifier fields
  const localId = element.querySelector('gml\\:localId, localId')?.textContent;
  if (localId) {
    const numberMatch = localId.match(/(\d+)/);
    if (numberMatch) {
      const lotNumber = numberMatch[1].replace(/^0+/, '') || numberMatch[1];
      console.log('📍 Extracted lot number from localId:', lotNumber);
      return lotNumber;
    }
  }
  
  // Look for numeric content in name fields
  const nameElement = element.querySelector('gml\\:name, name, gml\\:identifier, identifier');
  if (nameElement?.textContent) {
    const numberMatch = nameElement.textContent.match(/(\d+)/);
    if (numberMatch) {
      const lotNumber = numberMatch[1].replace(/^0+/, '') || numberMatch[1];
      console.log('📍 Extracted lot number from name:', lotNumber);
      return lotNumber;
    }
  }
  
  console.log('❌ No lot number found for element');
  return undefined;
};

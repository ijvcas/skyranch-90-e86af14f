// Enhanced lot number extraction from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  console.log('\n🔍 === EXTRACTING LOT NUMBER ===');
  
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    console.log(`🆔 Processing gml:id: ${gmlId}`);
    
    // Enhanced Spanish cadastral pattern: Surface_ES.SDGC.CP.28128A00800002.1
    // The format is: 28128A followed by 8 digits, where we want the meaningful part
    const spanishMatch = gmlId.match(/28128A(\d{8})/);
    if (spanishMatch) {
      const fullNumber = spanishMatch[1]; // Gets the 8 digits after 28128A
      console.log(`📋 Full cadastral number: 28128A${fullNumber}`);
      
      // For Spanish cadastral references, the lot number is typically the last 2-3 digits
      // Remove leading zeros but keep at least 2 digits for meaningful identification
      let lotNumber = fullNumber.replace(/^0+/, '');
      if (lotNumber.length < 2) {
        lotNumber = fullNumber.slice(-3); // Keep last 3 digits if result is too short
      }
      
      console.log(`✅ Extracted Spanish cadastral lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // Alternative pattern for other cadastral references
    const altMatch = gmlId.match(/(\d{5}[A-Z]\d{8})/);
    if (altMatch) {
      const cadastralRef = altMatch[1];
      console.log(`📋 Alternative cadastral reference: ${cadastralRef}`);
      
      // Extract the numeric part after letters (last 8 digits)
      const numericPart = cadastralRef.match(/[A-Z](\d{8})$/);
      if (numericPart) {
        let lotNumber = numericPart[1].replace(/^0+/, '');
        if (lotNumber.length < 2) {
          lotNumber = numericPart[1].slice(-3);
        }
        console.log(`✅ Extracted alternative lot number: ${lotNumber}`);
        return lotNumber;
      }
    }
    
    // Enhanced pattern for Surface IDs - extract meaningful numbers
    const surfaceMatch = gmlId.match(/Surface_ES\.SDGC\.CP\.(\d+[A-Z]\d+)/);
    if (surfaceMatch) {
      const cadastralCode = surfaceMatch[1];
      console.log(`🏗️ Surface cadastral code: ${cadastralCode}`);
      
      // Extract the numeric part after the letter
      const numericMatch = cadastralCode.match(/\d+[A-Z](\d+)/);
      if (numericMatch) {
        let lotNumber = numericMatch[1].replace(/^0+/, '');
        if (lotNumber.length < 2) {
          lotNumber = numericMatch[1].slice(-3);
        }
        console.log(`✅ Extracted surface lot number: ${lotNumber}`);
        return lotNumber;
      }
    }
    
    // Try to extract any meaningful number sequence at the end
    const numberMatch = gmlId.match(/(\d{2,})(?!.*\d)/); // Last number sequence with at least 2 digits
    if (numberMatch) {
      let lotNumber = numberMatch[1].replace(/^0+/, '');
      if (lotNumber.length < 1) {
        lotNumber = numberMatch[1];
      }
      console.log(`✅ Extracted generic lot number: ${lotNumber}`);
      return lotNumber;
    }
  }
  
  // Look for localId or other identifier fields
  const localId = element.querySelector('gml\\:localId, localId')?.textContent;
  if (localId) {
    console.log(`🆔 Processing localId: ${localId}`);
    const numberMatch = localId.match(/(\d+)/);
    if (numberMatch) {
      let lotNumber = numberMatch[1].replace(/^0+/, '');
      if (lotNumber.length < 1) {
        lotNumber = numberMatch[1];
      }
      console.log(`✅ Extracted lot number from localId: ${lotNumber}`);
      return lotNumber;
    }
  }
  
  // Look for numeric content in name fields
  const nameElement = element.querySelector('gml\\:name, name, gml\\:identifier, identifier');
  if (nameElement?.textContent) {
    console.log(`🏷️ Processing name element: ${nameElement.textContent}`);
    const numberMatch = nameElement.textContent.match(/(\d+)/);
    if (numberMatch) {
      let lotNumber = numberMatch[1].replace(/^0+/, '');
      if (lotNumber.length < 1) {
        lotNumber = numberMatch[1];
      }
      console.log(`✅ Extracted lot number from name: ${lotNumber}`);
      return lotNumber;
    }
  }
  
  console.log('❌ No lot number found for element');
  console.log('=== END LOT NUMBER EXTRACTION ===\n');
  return undefined;
};

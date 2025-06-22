// Enhanced lot number extraction from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  console.log('\n🔍 === EXTRACTING LOT NUMBER ===');
  
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    console.log(`🆔 Processing gml:id: ${gmlId}`);
    
    // FIXED: Enhanced Spanish cadastral pattern: Surface_ES.SDGC.CP.28128A00800002.1
    // The format is: 28128A followed by 8 digits, extract the last 3-4 meaningful digits
    const spanishMatch = gmlId.match(/28128A(\d{8})/);
    if (spanishMatch) {
      const fullNumber = spanishMatch[1]; // Gets the 8 digits after 28128A
      console.log(`📋 Full cadastral number: 28128A${fullNumber}`);
      
      // For Spanish cadastral references, extract the meaningful lot number
      // Take the last 3 digits and remove leading zeros, but keep meaningful numbers
      let lotNumber = fullNumber.slice(-3).replace(/^0+/, '');
      
      // If we get an empty string or single digit, take last 4 digits
      if (lotNumber.length === 0) {
        lotNumber = fullNumber.slice(-4).replace(/^0+/, '');
      }
      
      // If still empty, use the last digit
      if (lotNumber.length === 0) {
        lotNumber = fullNumber.slice(-1);
      }
      
      console.log(`✅ Extracted Spanish cadastral lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // Alternative Spanish cadastral pattern with dots: 28128A00700122.1
    const altSpanishMatch = gmlId.match(/28128A(\d{8})\.(\d+)/);
    if (altSpanishMatch) {
      const mainNumber = altSpanishMatch[1];
      const subNumber = altSpanishMatch[2];
      console.log(`📋 Alternative Spanish cadastral: 28128A${mainNumber}.${subNumber}`);
      
      // Use the last 3 digits of main number
      let lotNumber = mainNumber.slice(-3).replace(/^0+/, '');
      if (lotNumber.length === 0) {
        lotNumber = mainNumber.slice(-1);
      }
      
      console.log(`✅ Extracted alternative Spanish lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // Enhanced pattern for Surface IDs - extract meaningful numbers
    const surfaceMatch = gmlId.match(/Surface_ES\.SDGC\.CP\.(\d+[A-Z]\d+)/);
    if (surfaceMatch) {
      const cadastralCode = surfaceMatch[1];
      console.log(`🏗️ Surface cadastral code: ${cadastralCode}`);
      
      // Extract the numeric part after the letter (28128A00700122 -> 00700122)
      const numericMatch = cadastralCode.match(/28128A(\d{8})/);
      if (numericMatch) {
        const fullNumber = numericMatch[1];
        let lotNumber = fullNumber.slice(-3).replace(/^0+/, '');
        if (lotNumber.length === 0) {
          lotNumber = fullNumber.slice(-1);
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

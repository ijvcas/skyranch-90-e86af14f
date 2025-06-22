
// Enhanced lot number extraction from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  console.log('\n🔍 === EXTRACTING LOT NUMBER ===');
  
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    console.log(`🆔 Processing gml:id: ${gmlId}`);
    
    // FIXED: Enhanced Spanish cadastral pattern matching for format like: 28128A00700122.1
    const detailedSpanishMatch = gmlId.match(/28128A(\d{8})(?:\.(\d+))?/);
    if (detailedSpanishMatch) {
      const mainNumber = detailedSpanishMatch[1]; // 00700122
      const subNumber = detailedSpanishMatch[2]; // 1 (if exists)
      
      console.log(`📋 Detailed Spanish cadastral: 28128A${mainNumber}${subNumber ? '.' + subNumber : ''}`);
      
      // Extract meaningful lot number from the 8-digit sequence
      // For 00700122, we want to extract 122
      let lotNumber = mainNumber.replace(/^0+/, ''); // Remove leading zeros
      
      // If we get a very long number, take the last 3-4 meaningful digits
      if (lotNumber.length > 4) {
        // Look for the last meaningful segment (non-zero part)
        const meaningfulMatch = mainNumber.match(/0*(\d{1,4})$/);
        if (meaningfulMatch) {
          lotNumber = meaningfulMatch[1];
        }
      }
      
      // If still empty or just one digit, use a different approach
      if (lotNumber.length === 0 || (lotNumber.length === 1 && lotNumber === '0')) {
        // Use the last 3 digits, removing only leading zeros from that segment
        lotNumber = mainNumber.slice(-3).replace(/^0+/, '') || mainNumber.slice(-1);
      }
      
      console.log(`✅ Extracted Spanish cadastral lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // Alternative pattern for Surface IDs - extract meaningful numbers
    const surfaceMatch = gmlId.match(/Surface_ES\.SDGC\.CP\.(\d+[A-Z]\d+)/);
    if (surfaceMatch) {
      const cadastralCode = surfaceMatch[1];
      console.log(`🏗️ Surface cadastral code: ${cadastralCode}`);
      
      // Extract the numeric part after the letter (28128A00700122 -> 00700122)
      const numericMatch = cadastralCode.match(/28128A(\d{8})/);
      if (numericMatch) {
        const fullNumber = numericMatch[1];
        // Apply same logic as above
        let lotNumber = fullNumber.replace(/^0+/, '');
        if (lotNumber.length > 4) {
          const meaningfulMatch = fullNumber.match(/0*(\d{1,4})$/);
          if (meaningfulMatch) {
            lotNumber = meaningfulMatch[1];
          }
        }
        if (lotNumber.length === 0) {
          lotNumber = fullNumber.slice(-3).replace(/^0+/, '') || fullNumber.slice(-1);
        }
        console.log(`✅ Extracted surface lot number: ${lotNumber}`);
        return lotNumber;
      }
    }
    
    // Generic pattern for any number sequence
    const numberMatch = gmlId.match(/(\d{3,})(?!.*\d)/); // Last number sequence with at least 3 digits
    if (numberMatch) {
      let number = numberMatch[1];
      // Apply meaningful number extraction
      let lotNumber = number.replace(/^0+/, '');
      if (lotNumber.length > 4) {
        const meaningfulMatch = number.match(/0*(\d{1,4})$/);
        if (meaningfulMatch) {
          lotNumber = meaningfulMatch[1];
        }
      }
      if (lotNumber.length === 0) {
        lotNumber = number.slice(-1);
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

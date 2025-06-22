
// Enhanced lot number extraction from various GML sources
export const extractLotNumber = (element: Element): string | undefined => {
  console.log('\n🔍 === EXTRACTING LOT NUMBER ===');
  
  // Try to extract from common cadastral ID patterns
  const gmlId = element.getAttribute('gml:id') || element.getAttribute('id');
  if (gmlId) {
    console.log(`🆔 Processing gml:id: ${gmlId}`);
    
    // ENHANCED: Surface format pattern matching for format like: Surface_ES.SDGC.CP.28128A00700122.1
    const surfaceMatch = gmlId.match(/Surface_ES\.SDGC\.CP\.28128A(\d{8})(?:\.(\d+))?/);
    if (surfaceMatch) {
      const mainNumber = surfaceMatch[1]; // 00700122
      const subNumber = surfaceMatch[2]; // 1 (if exists)
      
      console.log(`📋 Surface cadastral: 28128A${mainNumber}${subNumber ? '.' + subNumber : ''}`);
      
      // Extract meaningful lot number from the 8-digit sequence
      // For 00700122, we want to extract 122
      // For 00710007, we want to extract 7
      // For 00700006, we want to extract 6
      let lotNumber = mainNumber.replace(/^0+/, ''); // Remove leading zeros
      
      // If we get an empty string (all zeros), use the last non-zero digit
      if (lotNumber.length === 0) {
        lotNumber = mainNumber.slice(-1);
      }
      
      // If still very long, take the last meaningful part
      if (lotNumber.length > 4) {
        // Look for patterns like 700122 -> 122, 710007 -> 7
        const meaningfulMatch = mainNumber.match(/0*(\d{1,3})$/);
        if (meaningfulMatch) {
          lotNumber = meaningfulMatch[1];
        }
      }
      
      console.log(`✅ Extracted Surface lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // FIXED: Enhanced Spanish cadastral pattern matching for format like: 28128A00700122.1
    const detailedSpanishMatch = gmlId.match(/28128A(\d{8})(?:\.(\d+))?/);
    if (detailedSpanishMatch) {
      const mainNumber = detailedSpanishMatch[1]; // 00700122
      const subNumber = detailedSpanishMatch[2]; // 1 (if exists)
      
      console.log(`📋 Detailed Spanish cadastral: 28128A${mainNumber}${subNumber ? '.' + subNumber : ''}`);
      
      // Extract meaningful lot number from the 8-digit sequence
      let lotNumber = mainNumber.replace(/^0+/, ''); // Remove leading zeros
      
      if (lotNumber.length === 0) {
        lotNumber = mainNumber.slice(-1);
      }
      
      // If still very long, take the last meaningful part
      if (lotNumber.length > 4) {
        const meaningfulMatch = mainNumber.match(/0*(\d{1,3})$/);
        if (meaningfulMatch) {
          lotNumber = meaningfulMatch[1];
        }
      }
      
      console.log(`✅ Extracted Spanish cadastral lot number: ${lotNumber}`);
      return lotNumber;
    }
    
    // Generic pattern for any number sequence
    const numberMatch = gmlId.match(/(\d{3,})(?!.*\d)/); // Last number sequence with at least 3 digits
    if (numberMatch) {
      let number = numberMatch[1];
      // Apply meaningful number extraction
      let lotNumber = number.replace(/^0+/, '');
      if (lotNumber.length === 0) {
        lotNumber = number.slice(-1);
      }
      if (lotNumber.length > 4) {
        const meaningfulMatch = number.match(/0*(\d{1,3})$/);
        if (meaningfulMatch) {
          lotNumber = meaningfulMatch[1];
        }
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

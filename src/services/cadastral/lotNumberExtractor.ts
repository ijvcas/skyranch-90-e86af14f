
import type { CadastralParcel } from '../cadastralService';

// Enhanced lot number extraction specifically for Spanish cadastral format
export const extractLotNumberFromParcelId = (parcelId: string): string | undefined => {
  console.log(`🔍 === EXTRACTING LOT NUMBER FROM: ${parcelId} ===`);
  
  // FIXED: Enhanced patterns for Spanish cadastral format
  const patterns = [
    // Surface format: Surface_ES.SDGC.CP.28128A00700122.1
    /Surface_ES\.SDGC\.CP\.28128A(\d{8})(?:\.(\d+))?/,
    // Direct Spanish cadastral: 28128A00700122.1
    /28128A(\d{8})(?:\.(\d+))?/,
    // Fallback for any 8-digit sequence
    /(\d{8})/
  ];
  
  for (const pattern of patterns) {
    const match = parcelId.match(pattern);
    if (match) {
      const mainNumber = match[1]; // e.g., "00700122"
      console.log(`📋 Found 8-digit sequence: ${mainNumber}`);
      
      // Extract meaningful lot number from the 8-digit sequence
      // For 00700122 -> 122, 00700007 -> 7, 00700006 -> 6, etc.
      let lotNumber = mainNumber.replace(/^0+/, ''); // Remove leading zeros
      
      // If we get an empty string (all zeros), use the last digit
      if (lotNumber.length === 0) {
        lotNumber = mainNumber.slice(-1);
      }
      
      // For very long numbers, extract the last 3 digits if they make sense
      if (lotNumber.length > 4) {
        const lastThreeMatch = mainNumber.match(/0*(\d{1,3})$/);
        if (lastThreeMatch) {
          lotNumber = lastThreeMatch[1];
        }
      }
      
      console.log(`✅ Extracted lot number: ${lotNumber}`);
      return lotNumber;
    }
  }
  
  console.log(`❌ No lot number found for: ${parcelId}`);
  return undefined;
};

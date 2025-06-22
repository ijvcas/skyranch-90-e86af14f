
import { detectCRSFromGML } from './crsDetector';

// Legacy function for backward compatibility
export const extractCRSFromGML = (xmlDoc: Document): string => {
  console.log('\n🔍 LEGACY CRS EXTRACTION (redirecting to enhanced detector)...');
  return detectCRSFromGML(xmlDoc);
};


export const extractCRSFromGML = (xmlDoc: Document): string => {
  console.log('\n🔍 SEARCHING FOR CRS INFORMATION...');
  const crsElements = xmlDoc.querySelectorAll('[srsName], [crs], [srs]');
  console.log(`Found ${crsElements.length} elements with CRS information`);
  
  if (crsElements.length > 0) {
    const srsName = crsElements[0].getAttribute('srsName') || 
                    crsElements[0].getAttribute('crs') || 
                    crsElements[0].getAttribute('srs');
    if (srsName) {
      console.log('🎯 Found CRS in GML:', srsName);
      if (srsName.includes('25830')) {
        return 'EPSG:25830';
      } else if (srsName.includes('25829')) {
        return 'EPSG:25829';
      } else if (srsName.includes('25831')) {
        return 'EPSG:25831';
      } else if (srsName.includes('4326')) {
        return 'EPSG:4326';
      } else {
        return srsName.includes('EPSG') ? srsName : 'EPSG:25830';
      }
    }
  }
  
  return 'EPSG:25830'; // Default to Spanish UTM 30N
};


// Enhanced CRS detection for better coordinate system handling
export const detectCRSFromGML = (xmlDoc: Document): string => {
  console.log('\n🔍 ENHANCED CRS DETECTION...');
  
  // Check for explicit CRS declarations
  const crsElements = xmlDoc.querySelectorAll('[srsName], [crs], [srs], [epsg]');
  console.log(`Found ${crsElements.length} elements with CRS information`);
  
  for (const element of crsElements) {
    const srsName = element.getAttribute('srsName') || 
                    element.getAttribute('crs') || 
                    element.getAttribute('srs') ||
                    element.getAttribute('epsg');
    
    if (srsName) {
      console.log('🎯 Found explicit CRS:', srsName);
      
      // Extract EPSG code from various formats
      if (srsName.includes('25830') || srsName.includes('EPSG:25830')) {
        return 'EPSG:25830';
      } else if (srsName.includes('25829') || srsName.includes('EPSG:25829')) {
        return 'EPSG:25829';
      } else if (srsName.includes('25831') || srsName.includes('EPSG:25831')) {
        return 'EPSG:25831';
      } else if (srsName.includes('4326') || srsName.includes('EPSG:4326')) {
        return 'EPSG:4326';
      } else if (srsName.includes('3857') || srsName.includes('EPSG:3857')) {
        return 'EPSG:3857';
      }
    }
  }
  
  // Check in XML namespace declarations
  const rootElement = xmlDoc.documentElement;
  const attributes = rootElement.attributes;
  
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.name.includes('srsName') || attr.value.includes('EPSG')) {
      console.log('📍 Found CRS in namespace:', attr.value);
      if (attr.value.includes('25830')) return 'EPSG:25830';
      if (attr.value.includes('25829')) return 'EPSG:25829';
      if (attr.value.includes('25831')) return 'EPSG:25831';
      if (attr.value.includes('4326')) return 'EPSG:4326';
    }
  }
  
  // Analyze coordinate values to detect CRS
  const coordElements = xmlDoc.querySelectorAll('gml\\:coordinates, coordinates, gml\\:posList, posList');
  if (coordElements.length > 0) {
    const firstCoordText = coordElements[0].textContent?.trim();
    if (firstCoordText) {
      const coords = firstCoordText.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      if (coords.length >= 2) {
        const x = coords[0];
        const y = coords[1];
        
        console.log(`🔍 Analyzing sample coordinates: (${x}, ${y})`);
        
        // Spanish UTM zones detection based on coordinate ranges
        if (x >= 300000 && x <= 500000 && y >= 4400000 && y <= 4600000) {
          console.log('✅ Detected Spanish UTM Zone 30N based on coordinate analysis');
          return 'EPSG:25830';
        } else if (x >= 200000 && x <= 400000 && y >= 4400000 && y <= 4600000) {
          console.log('✅ Detected Spanish UTM Zone 29N based on coordinate analysis');
          return 'EPSG:25829';
        } else if (x >= 400000 && x <= 600000 && y >= 4400000 && y <= 4600000) {
          console.log('✅ Detected Spanish UTM Zone 31N based on coordinate analysis');
          return 'EPSG:25831';
        } else if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
          console.log('✅ Detected WGS84 based on coordinate analysis');
          return 'EPSG:4326';
        }
      }
    }
  }
  
  console.log('⚠️ Could not detect CRS, defaulting to Spanish UTM 30N');
  return 'EPSG:25830'; // Default for Spanish cadastral data
};

export const validateCRS = (crs: string): boolean => {
  const validCRS = ['EPSG:25829', 'EPSG:25830', 'EPSG:25831', 'EPSG:4326', 'EPSG:3857'];
  return validCRS.includes(crs);
};

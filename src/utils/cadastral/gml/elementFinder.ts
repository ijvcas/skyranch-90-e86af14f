
import { isCoordinateData } from '../coordinateUtils';

export const findGMLElements = (xmlDoc: Document): Element[] => {
  console.log('\n🔍 SEARCHING FOR GML GEOMETRY ELEMENTS...');
  const gmlSelectors = [
    'gml\\:Surface', 'Surface',
    'gml\\:Polygon', 'Polygon', 
    'gml\\:LinearRing', 'LinearRing',
    'gml\\:featureMember', 'featureMember',
    'gml\\:Feature', 'Feature',
    'featureMember > *',
    '*[gml\\:id]',
  ];

  let foundElements: Element[] = [];
  
  for (const selector of gmlSelectors) {
    try {
      const elements = xmlDoc.querySelectorAll(selector);
      if (elements.length > 0) {
        foundElements = Array.from(elements);
        console.log(`✅ Found ${elements.length} GML elements of type: ${selector}`);
        break;
      }
    } catch (e) {
      console.log(`❌ Selector ${selector} failed, trying next`);
    }
  }

  // Fallback: search for any element containing coordinate-like data
  if (foundElements.length === 0) {
    console.log('🔄 No structured elements found, trying fallback search...');
    const allElements = xmlDoc.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent || '';
      if (isCoordinateData(text) && text.length > 20) {
        foundElements.push(element);
      }
    }
    console.log(`🔄 Fallback search found ${foundElements.length} elements with coordinate data`);
  }

  return foundElements;
};

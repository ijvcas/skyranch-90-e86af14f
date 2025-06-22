
// Helper function to detect coordinate-like data
export const isCoordinateData = (text: string): boolean => {
  if (!text || text.length < 10) return false;
  
  // Look for patterns that suggest coordinates
  const coordinatePatterns = [
    /\d+\.\d+[,\s]+\d+\.\d+/, // decimal coordinates
    /\d+[,\s]+\d+[,\s]+\d+/, // integer coordinates
    /-?\d+\.\d+\s+-?\d+\.\d+/, // negative coordinates
  ];
  
  return coordinatePatterns.some(pattern => pattern.test(text));
};

// Enhanced coordinate extraction
export const extractCoordinatesFromElement = (element: Element): number[][] => {
  const text = element.textContent?.trim() || '';
  if (!text) return [];
  
  console.log('Extracting coordinates from text:', text.substring(0, 200));
  
  const coords: number[][] = [];
  
  // Try different coordinate formats
  const formats = [
    // Format: "x1,y1 x2,y2 x3,y3"
    () => {
      if (text.includes(' ') && text.includes(',')) {
        const pairs = text.split(/\s+/);
        pairs.forEach(pair => {
          const [x, y] = pair.split(',').map(Number);
          if (!isNaN(x) && !isNaN(y)) coords.push([x, y]);
        });
      }
    },
    // Format: "x1 y1 x2 y2 x3 y3"
    () => {
      const numbers = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      if (numbers.length % 2 === 0) {
        for (let i = 0; i < numbers.length; i += 2) {
          coords.push([numbers[i], numbers[i + 1]]);
        }
      }
    },
    // Format: "x1;y1;x2;y2;x3;y3"
    () => {
      if (text.includes(';')) {
        const numbers = text.split(';').map(Number).filter(n => !isNaN(n));
        if (numbers.length % 2 === 0) {
          for (let i = 0; i < numbers.length; i += 2) {
            coords.push([numbers[i], numbers[i + 1]]);
          }
        }
      }
    }
  ];
  
  for (const format of formats) {
    format();
    if (coords.length >= 3) break;
  }
  
  console.log(`Extracted ${coords.length} coordinate pairs`);
  return coords;
};

// Enhanced GML coordinate extraction
export const extractGMLCoordinates = (element: Element): number[][] => {
  const text = element.textContent?.trim() || '';
  if (!text) return [];
  
  const coords: number[][] = [];
  
  // GML coordinates can be space or comma separated
  if (element.tagName.includes('coordinates')) {
    // Format: "x1,y1 x2,y2 x3,y3"
    const pairs = text.split(/\s+/);
    pairs.forEach(pair => {
      const [x, y] = pair.split(',').map(Number);
      if (!isNaN(x) && !isNaN(y)) coords.push([x, y]);
    });
  } else {
    // posList format: "x1 y1 x2 y2 x3 y3"
    const numbers = text.split(/\s+/).map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      if (!isNaN(numbers[i]) && !isNaN(numbers[i + 1])) {
        coords.push([numbers[i], numbers[i + 1]]);
      }
    }
  }
  
  return coords;
};

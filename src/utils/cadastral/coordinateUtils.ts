
// Helper function to detect coordinate-like data
export const isCoordinateData = (text: string): boolean => {
  if (!text || text.length < 10) return false;
  
  // Look for patterns that suggest coordinates
  const coordinatePatterns = [
    /\d+\.\d+[,\s]+\d+\.\d+/, // decimal coordinates
    /\d+[,\s]+\d+[,\s]+\d+/, // integer coordinates
    /-?\d+\.\d+\s+-?\d+\.\d+/, // negative coordinates
    /\d{6,}\.\d+\s+\d{7,}\.\d+/, // UTM coordinates (large numbers)
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
    // Format: "x1 y1 x2 y2 x3 y3" (space separated)
    () => {
      const numbers = text.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      if (numbers.length % 2 === 0 && numbers.length >= 6) {
        for (let i = 0; i < numbers.length; i += 2) {
          coords.push([numbers[i], numbers[i + 1]]);
        }
      }
    },
    // Format: "x1;y1;x2;y2;x3;y3"
    () => {
      if (text.includes(';')) {
        const numbers = text.split(';').map(Number).filter(n => !isNaN(n));
        if (numbers.length % 2 === 0 && numbers.length >= 6) {
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
  
  console.log(`Extracting GML coordinates from ${element.tagName}:`, text.substring(0, 100));
  
  const coords: number[][] = [];
  
  // GML coordinates can be in different formats
  if (element.tagName.toLowerCase().includes('coordinates') || element.tagName.includes('coordinates')) {
    // Format: "x1,y1 x2,y2 x3,y3" or "x1,y1,z1 x2,y2,z2"
    const pairs = text.split(/\s+/).filter(p => p.trim().length > 0);
    pairs.forEach(pair => {
      const parts = pair.split(',').map(Number);
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        coords.push([parts[0], parts[1]]);
      }
    });
  } else if (element.tagName.toLowerCase().includes('poslist') || element.tagName.includes('posList')) {
    // posList format: "x1 y1 x2 y2 x3 y3" or "x1 y1 z1 x2 y2 z2"
    const numbers = text.split(/\s+/).map(Number).filter(n => !isNaN(n));
    
    // Try different dimensions (2D, 3D)
    const dimensions = [2, 3];
    for (const dim of dimensions) {
      if (numbers.length % dim === 0 && numbers.length >= dim * 3) {
        coords.length = 0; // Clear previous attempts
        for (let i = 0; i < numbers.length; i += dim) {
          coords.push([numbers[i], numbers[i + 1]]);
        }
        break;
      }
    }
  } else {
    // Fallback: try generic coordinate extraction
    return extractCoordinatesFromElement(element);
  }
  
  console.log(`Extracted ${coords.length} GML coordinate pairs`);
  return coords;
};

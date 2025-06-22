
// Coordinate validation and preview system
import { SKYRANCH_COORDINATES } from './coordinateSystemRebuild';

export interface CoordinateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  previewData: {
    originalCentroid: { lat: number; lng: number };
    finalCentroid: { lat: number; lng: number };
    distanceFromSkyRanch: number;
    coordinateCount: number;
  };
}

export const validateAndPreviewCoordinates = (
  coordinates: { lat: number; lng: number }[]
): CoordinateValidationResult => {
  const result: CoordinateValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    previewData: {
      originalCentroid: { lat: 0, lng: 0 },
      finalCentroid: { lat: 0, lng: 0 },
      distanceFromSkyRanch: 0,
      coordinateCount: coordinates.length
    }
  };

  if (coordinates.length === 0) {
    result.isValid = false;
    result.errors.push('No coordinates provided');
    return result;
  }

  if (coordinates.length < 3) {
    result.isValid = false;
    result.errors.push('At least 3 coordinates required for a valid polygon');
    return result;
  }

  // Calculate centroid
  const totalLat = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
  const totalLng = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
  const centroid = {
    lat: totalLat / coordinates.length,
    lng: totalLng / coordinates.length
  };

  result.previewData.originalCentroid = centroid;
  result.previewData.finalCentroid = centroid;

  // Calculate distance from SkyRanch
  const distance = Math.sqrt(
    Math.pow(centroid.lat - SKYRANCH_COORDINATES.lat, 2) + 
    Math.pow(centroid.lng - SKYRANCH_COORDINATES.lng, 2)
  );

  result.previewData.distanceFromSkyRanch = distance * 111000; // Convert to meters

  // Validation checks
  const maxDistance = 1000; // 1km in meters
  if (result.previewData.distanceFromSkyRanch > maxDistance) {
    result.warnings.push(`Coordinates are ${Math.round(result.previewData.distanceFromSkyRanch)}m from SkyRanch center`);
  }

  // Check for invalid coordinates
  const invalidCoords = coordinates.filter(coord => 
    isNaN(coord.lat) || isNaN(coord.lng) || 
    Math.abs(coord.lat) > 90 || Math.abs(coord.lng) > 180
  );

  if (invalidCoords.length > 0) {
    result.isValid = false;
    result.errors.push(`${invalidCoords.length} invalid coordinates found`);
  }

  console.log('📋 Coordinate validation result:', result);
  return result;
};

export const createCoordinatePreview = (coordinates: { lat: number; lng: number }[]) => {
  const validation = validateAndPreviewCoordinates(coordinates);
  
  return {
    ...validation,
    mapCenter: validation.previewData.finalCentroid,
    bounds: {
      north: Math.max(...coordinates.map(c => c.lat)),
      south: Math.min(...coordinates.map(c => c.lat)),
      east: Math.max(...coordinates.map(c => c.lng)),
      west: Math.min(...coordinates.map(c => c.lng))
    }
  };
};

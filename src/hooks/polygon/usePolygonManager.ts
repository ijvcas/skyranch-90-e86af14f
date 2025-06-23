
import { useState, useCallback } from 'react';
import { saveLotPolygon, deleteLotPolygon, getPolygonDataForLots } from '@/services/lotPolygonService';
import { useLotStore } from '@/stores/lotStore';
import { toast } from 'sonner';

export const usePolygonManager = (
  map: google.maps.Map | null,
  onPolygonClick?: (lotId: string) => void
) => {
  const [polygons, setPolygons] = useState<Map<string, google.maps.Polygon>>(new Map());
  const { addLot } = useLotStore();

  const calculatePolygonArea = useCallback((polygon: google.maps.Polygon): number => {
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    return area / 10000; // Convert from m² to hectares
  }, []);

  const handlePolygonComplete = useCallback(async (
    polygon: google.maps.Polygon, 
    lotName: string,
    lotType: 'property' | 'pasture' = 'pasture'
  ) => {
    if (!map) return;

    try {
      console.log(`🎯 Creating ${lotType} polygon for lot:`, lotName);
      
      const area = calculatePolygonArea(polygon);
      console.log(`📏 Calculated area: ${area.toFixed(2)} hectares`);

      // Create the lot with specified type
      const success = await addLot({
        name: lotName,
        description: lotType === 'property' ? 'Lote de propiedad fijo' : 'Lote de pastoreo',
        sizeHectares: area,
        status: 'active',
        grassCondition: 'good',
        lotType
      });

      if (success) {
        // Set polygon style based on lot type
        const polygonOptions = lotType === 'property' ? {
          fillColor: '#E5E7EB',
          fillOpacity: 0.15,
          strokeColor: '#6B7280',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          editable: false,
          clickable: true
        } : {
          fillColor: '#10B981',
          fillOpacity: 0.3,
          strokeColor: '#059669',
          strokeWeight: 2,
          strokeOpacity: 0.9,
          editable: true,
          clickable: true
        };

        polygon.setOptions(polygonOptions);
        
        toast.success(`Lote ${lotType === 'property' ? 'de propiedad' : 'de pastoreo'} "${lotName}" creado exitosamente`);
      } else {
        polygon.setMap(null);
        toast.error('Error al crear el lote');
      }
    } catch (error) {
      console.error('❌ Error creating polygon:', error);
      polygon.setMap(null);
      toast.error('Error al crear el lote');
    }
  }, [map, addLot, calculatePolygonArea]);

  const loadSavedPolygons = useCallback(async (lots: any[], customOptions?: any) => {
    if (!map || !lots.length) return;

    try {
      console.log('🔄 Loading saved polygons for lots...');
      const polygonData = await getPolygonDataForLots();
      
      lots.forEach((lot) => {
        const data = polygonData.find(p => p.lotId === lot.id);
        if (!data?.coordinates) return;

        try {
          const coordinates = typeof data.coordinates === 'string' 
            ? JSON.parse(data.coordinates) 
            : data.coordinates;

          if (!Array.isArray(coordinates) || coordinates.length === 0) return;

          const path = coordinates.map((coord: any) => ({
            lat: parseFloat(coord.lat || coord.latitude || coord[0]),
            lng: parseFloat(coord.lng || coord.longitude || coord[1])
          }));

          // Determine styling based on lot type or use custom options
          const isPropertyLot = lot.lotType === 'property';
          const polygonOptions = customOptions || (isPropertyLot ? {
            fillColor: '#E5E7EB',
            fillOpacity: 0.15,
            strokeColor: '#6B7280',
            strokeWeight: 2,
            strokeOpacity: 0.8,
            editable: false,
            clickable: true
          } : {
            fillColor: '#10B981',
            fillOpacity: 0.3,
            strokeColor: '#059669',
            strokeWeight: 2,
            strokeOpacity: 0.9,
            editable: true,
            clickable: true
          });

          const polygon = new google.maps.Polygon({
            paths: path,
            map: map,
            ...polygonOptions
          });

          // Add click listener
          if (onPolygonClick) {
            polygon.addListener('click', () => {
              console.log(`🖱️ Polygon clicked for lot: ${lot.name}`);
              onPolygonClick(lot.id);
            });
          }

          setPolygons(prev => new Map(prev.set(lot.id, polygon)));
          console.log(`✅ Loaded polygon for ${lot.lotType || 'pasture'} lot: ${lot.name}`);
        } catch (error) {
          console.error(`❌ Error parsing coordinates for lot ${lot.name}:`, error);
        }
      });
    } catch (error) {
      console.error('❌ Error loading saved polygons:', error);
    }
  }, [map, onPolygonClick]);

  const deletePolygon = useCallback(async (lotId: string) => {
    const polygon = polygons.get(lotId);
    if (polygon) {
      polygon.setMap(null);
      setPolygons(prev => {
        const newMap = new Map(prev);
        newMap.delete(lotId);
        return newMap;
      });

      try {
        await deleteLotPolygon(lotId);
        console.log(`🗑️ Deleted polygon for lot: ${lotId}`);
      } catch (error) {
        console.error('❌ Error deleting polygon from database:', error);
      }
    }
  }, [polygons]);

  const clearAllPolygons = useCallback(() => {
    console.log('🧹 Clearing all polygons from map...');
    polygons.forEach(polygon => polygon.setMap(null));
    setPolygons(new Map());
  }, [polygons]);

  const updatePolygonVisibility = useCallback((lotId: string, visible: boolean) => {
    const polygon = polygons.get(lotId);
    if (polygon) {
      polygon.setVisible(visible);
    }
  }, [polygons]);

  return {
    polygons,
    handlePolygonComplete,
    loadSavedPolygons,
    deletePolygon,
    clearAllPolygons,
    updatePolygonVisibility
  };
};

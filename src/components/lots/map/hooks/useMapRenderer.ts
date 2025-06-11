
import { useRef, useCallback } from 'react';
import { type Lot } from '@/stores/lotStore';
import { SKYRANCH_CENTER, calculatePolygonArea, formatArea } from '../mapConstants';
import { type LotPolygon } from './usePolygonStorage';

export const useMapRenderer = (lots: Lot[]) => {
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());

  const addSkyRanchLabel = useCallback((mapInstance: google.maps.Map) => {
    console.log('🏷️ Adding SKYRANCH label');
    new google.maps.Marker({
      position: SKYRANCH_CENTER,
      map: mapInstance,
      label: {
        text: 'SKYRANCH',
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        strokeWeight: 0,
        fillOpacity: 0
      }
    });
  }, []);

  const renderLotPolygons = useCallback((mapInstance: google.maps.Map, polygonsToRender: LotPolygon[]) => {
    if (!mapInstance) {
      console.error('❌ No map instance for rendering polygons');
      return;
    }

    console.log('📍 Rendering polygons:', polygonsToRender.length);
    
    // Clear existing
    polygons.current.forEach(polygon => polygon.setMap(null));
    labels.current.forEach(label => label.setMap(null));
    polygons.current.clear();
    labels.current.clear();

    polygonsToRender.forEach(lotPolygon => {
      const lot = lots.find(l => l.id === lotPolygon.lotId);
      if (!lot || !lotPolygon.coordinates.length) return;

      // Create polygon
      const polygon = new google.maps.Polygon({
        paths: lotPolygon.coordinates,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: lotPolygon.color,
        fillOpacity: 0.4,
        map: mapInstance,
        clickable: true
      });

      // Calculate area
      const area = calculatePolygonArea(lotPolygon.coordinates);
      const areaText = formatArea(area);

      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        e.stop();
        console.log(`Clicked polygon: ${lot.name} - ${areaText}`);
      });

      polygons.current.set(lotPolygon.lotId, polygon);

      // Add label
      const bounds = new google.maps.LatLngBounds();
      lotPolygon.coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();

      const labelMarker = new google.maps.Marker({
        position: center,
        map: mapInstance,
        label: {
          text: lot.name,
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        icon: {
          path: 'M 0,0 z',
          scale: 0,
          strokeWeight: 0,
          fillOpacity: 0
        },
        title: `${lot.name} - Área: ${areaText}`
      });

      labels.current.set(lotPolygon.lotId, labelMarker);
    });

    console.log('✅ Polygons rendered successfully');
  }, [lots]);

  const togglePolygonsVisibility = useCallback(() => {
    console.log('👁️ Toggling polygons visibility');
    polygons.current.forEach(polygon => {
      const visible = polygon.getVisible();
      polygon.setVisible(!visible);
    });
  }, []);

  const toggleLabelsVisibility = useCallback(() => {
    console.log('🏷️ Toggling labels visibility');
    labels.current.forEach(label => {
      const visible = label.getVisible();
      label.setVisible(!visible);
    });
  }, []);

  return {
    addSkyRanchLabel,
    renderLotPolygons,
    togglePolygonsVisibility,
    toggleLabelsVisibility
  };
};

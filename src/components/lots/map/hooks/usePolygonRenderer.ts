
import { useRef } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { calculatePolygonArea, formatArea } from '../mapConstants';
import { type LotPolygon } from '../utils/mapStorage';

export const usePolygonRenderer = (lots: Lot[]) => {
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());
  const { toast } = useToast();

  const clearPolygonsAndLabels = () => {
    polygons.current.forEach(polygon => polygon.setMap(null));
    labels.current.forEach(label => label.setMap(null));
    polygons.current.clear();
    labels.current.clear();
  };

  const renderLotPolygons = (map: google.maps.Map, lotPolygons: LotPolygon[]) => {
    if (!map) return;

    console.log('📍 Rendering user-defined lot polygons...');
    clearPolygonsAndLabels();

    lotPolygons.forEach(lotPolygon => {
      const lot = lots.find(l => l.id === lotPolygon.lotId);
      if (!lot || !lotPolygon.coordinates.length) return;

      console.log('🎨 Rendering polygon for lot:', lot.name, 'with', lotPolygon.coordinates.length, 'coordinates');

      // Create polygon
      const polygon = new google.maps.Polygon({
        paths: lotPolygon.coordinates,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeWeight: 2.5,
        fillColor: lotPolygon.color,
        fillOpacity: 0.4,
        map: map,
        clickable: true
      });

      // Calculate area
      const area = calculatePolygonArea(lotPolygon.coordinates);
      const areaText = formatArea(area);

      // Add click handler
      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        e.stop();
        toast({
          title: `${lot.name} - Polígono`,
          description: `Área: ${areaText}`,
        });
      });

      polygons.current.set(lotPolygon.lotId, polygon);

      // Calculate center point for label
      const bounds = new google.maps.LatLngBounds();
      lotPolygon.coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();

      // Create lot label marker
      const labelMarker = new google.maps.Marker({
        position: center,
        map: map,
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

      labelMarker.addListener('click', (e: google.maps.MapMouseEvent) => {
        e.stop();
        toast({
          title: `${lot.name} - Información`,
          description: `Área: ${areaText}`,
        });
      });

      labels.current.set(lotPolygon.lotId, labelMarker);
    });

    console.log('✅ User-defined lot polygons rendered successfully');
  };

  const togglePolygonsVisibility = () => {
    console.log('👁️ Toggling polygons visibility');
    polygons.current.forEach(polygon => {
      const visible = polygon.getVisible();
      polygon.setVisible(!visible);
    });
  };

  const toggleLabelsVisibility = () => {
    console.log('🏷️ Toggling labels visibility');
    labels.current.forEach(label => {
      const visible = label.getVisible();
      label.setVisible(!visible);
    });
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up polygon renderer');
    clearPolygonsAndLabels();
  };

  return {
    renderLotPolygons,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup
  };
};

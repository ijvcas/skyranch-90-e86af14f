
import { useRef, useState } from 'react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { LOT_COLORS, calculatePolygonArea, formatArea } from '../mapConstants';
import { mapStorage, type LotPolygon } from '../utils/mapStorage';

export const usePolygonManager = (lots: Lot[]) => {
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());
  const currentDrawing = useRef<google.maps.Polygon | null>(null);
  const drawingManager = useRef<google.maps.drawing.DrawingManager | null>(null);
  
  const [lotPolygons, setLotPolygons] = useState<LotPolygon[]>(() => mapStorage.getPolygons());
  
  const { toast } = useToast();

  const savePolygons = (polygons: LotPolygon[]) => {
    mapStorage.savePolygons(polygons);
    setLotPolygons(polygons);
  };

  const renderLotPolygons = (map: google.maps.Map) => {
    if (!map) return;

    console.log('📍 Rendering user-defined lot polygons...');

    // Clear existing polygons and labels
    polygons.current.forEach(polygon => polygon.setMap(null));
    labels.current.forEach(label => label.setMap(null));
    polygons.current.clear();
    labels.current.clear();

    lotPolygons.forEach(lotPolygon => {
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
        map: map,
        clickable: true
      });

      // Calculate area
      const area = calculatePolygonArea(lotPolygon.coordinates);
      const areaText = formatArea(area);

      // Add click handler - only show toast, don't navigate
      polygon.addListener('click', (e: google.maps.PolyMouseEvent) => {
        // Prevent event from bubbling to map
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

      // Create lot label marker with improved styling
      const labelMarker = new google.maps.Marker({
        position: center,
        map: map,
        label: {
          text: lot.name,
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          strokeWeight: 2,
          strokeColor: '#ffffff',
          fillOpacity: 0.9,
          fillColor: lotPolygon.color
        },
        title: `${lot.name} - Área: ${areaText}`
      });

      // Add click handler for label - only show toast
      labelMarker.addListener('click', (e: google.maps.MapMouseEvent) => {
        // Prevent event from bubbling to map
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

  const initializeDrawingManager = (map: google.maps.Map) => {
    drawingManager.current = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {
        strokeColor: '#ffffff',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: LOT_COLORS.default,
        fillOpacity: 0.35,
        editable: true
      }
    });

    drawingManager.current.setMap(map);
  };

  const startDrawingPolygon = (lotId: string) => {
    if (!drawingManager.current) return;

    console.log('🖊️ Starting polygon drawing for lot:', lotId);
    drawingManager.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);

    const listener = google.maps.event.addListener(
      drawingManager.current,
      'polygoncomplete',
      (polygon: google.maps.Polygon) => {
        console.log('✅ Polygon drawing completed');
        currentDrawing.current = polygon;
        drawingManager.current?.setDrawingMode(null);
        google.maps.event.removeListener(listener);
      }
    );
  };

  const saveCurrentPolygon = (lotId: string, map: google.maps.Map) => {
    if (!currentDrawing.current) {
      console.warn('⚠️ No polygon to save');
      return;
    }

    const path = currentDrawing.current.getPath();
    const coordinates: google.maps.LatLngLiteral[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    newPolygons.push({
      lotId,
      coordinates,
      color: LOT_COLORS.default
    });

    savePolygons(newPolygons);
    currentDrawing.current.setMap(null);
    currentDrawing.current = null;
    renderLotPolygons(map);

    console.log('💾 Polygon saved successfully for lot:', lotId);
    toast({
      title: "Polígono Guardado",
      description: "El polígono del lote ha sido guardado exitosamente.",
    });
  };

  const deletePolygonForLot = (lotId: string, map: google.maps.Map) => {
    const newPolygons = lotPolygons.filter(p => p.lotId !== lotId);
    savePolygons(newPolygons);
    renderLotPolygons(map);

    console.log('🗑️ Polygon deleted for lot:', lotId);
    toast({
      title: "Polígono Eliminado",
      description: "El polígono del lote ha sido eliminado.",
    });
  };

  const setPolygonColor = (lotId: string, color: string, map: google.maps.Map) => {
    const newPolygons = lotPolygons.map(p => 
      p.lotId === lotId ? { ...p, color } : p
    );
    savePolygons(newPolygons);
    renderLotPolygons(map);

    console.log('🎨 Polygon color changed for lot:', lotId, 'to:', color);
    toast({
      title: "Color Actualizado",
      description: "El color del polígono ha sido actualizado.",
    });
  };

  const togglePolygonsVisibility = () => {
    polygons.current.forEach(polygon => {
      const visible = polygon.getVisible();
      polygon.setVisible(!visible);
    });
  };

  const toggleLabelsVisibility = () => {
    labels.current.forEach(label => {
      const visible = label.getVisible();
      label.setVisible(!visible);
    });
  };

  const cleanup = () => {
    polygons.current.clear();
    labels.current.clear();
    if (currentDrawing.current) {
      currentDrawing.current.setMap(null);
    }
  };

  return {
    lotPolygons,
    renderLotPolygons,
    initializeDrawingManager,
    startDrawingPolygon,
    saveCurrentPolygon,
    deletePolygonForLot,
    setPolygonColor,
    togglePolygonsVisibility,
    toggleLabelsVisibility,
    cleanup
  };
};

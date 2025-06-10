
import { useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { SKYRANCH_CENTER, REAL_LOT_BOUNDARIES, LOT_COLORS, GOOGLE_MAPS_CONFIG } from './mapConstants';

export const useGoogleMapsInitialization = (
  lots: Lot[],
  onLotSelect: (lotId: string) => void
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const polygons = useRef<Map<string, google.maps.Polygon>>(new Map());
  const labels = useRef<Map<string, google.maps.Marker>>(new Map());
  const skyranchLabel = useRef<google.maps.Marker | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [lotColors, setLotColors] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  
  const { toast } = useToast();

  const addSkyRanchLabel = () => {
    if (!map.current) return;

    console.log('🏷️ Adding SKYRANCH label...');

    const marker = new google.maps.Marker({
      position: SKYRANCH_CENTER,
      map: map.current,
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

    skyranchLabel.current = marker;
    console.log('✅ SKYRANCH label added successfully');
  };

  const addLotBoundaries = () => {
    if (!map.current) return;

    console.log('📍 Adding irregular lot boundaries...');

    REAL_LOT_BOUNDARIES.forEach(boundary => {
      const color = lotColors[boundary.id] || LOT_COLORS.default;
      
      // Create polygon for lot boundary
      const polygon = new google.maps.Polygon({
        paths: boundary.coordinates,
        strokeColor: '#ffffff',
        strokeOpacity: 0.95,
        strokeWeight: selectedLot === boundary.id ? 4 : 2.5,
        fillColor: color,
        fillOpacity: selectedLot === boundary.id ? 0.7 : 0.4,
        map: map.current,
        clickable: true
      });

      // Add click handler
      polygon.addListener('click', () => {
        setSelectedLot(boundary.id);
        const matchingLot = lots.find(lot => 
          lot.name.toLowerCase().includes(boundary.number.toString())
        );
        if (matchingLot) {
          onLotSelect(matchingLot.id);
        }
        updatePolygonHighlight(boundary.id);
      });

      polygons.current.set(boundary.id, polygon);

      // Calculate center point for label
      const bounds = new google.maps.LatLngBounds();
      boundary.coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();

      // Create label marker
      const labelMarker = new google.maps.Marker({
        position: center,
        map: map.current,
        label: {
          text: boundary.number.toString(),
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 'bold'
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
          strokeWeight: 0,
          fillOpacity: 0
        }
      });

      labels.current.set(boundary.id, labelMarker);
    });

    console.log('✅ Irregular lot boundaries added successfully');
  };

  const updatePolygonHighlight = (lotId: string) => {
    polygons.current.forEach((polygon, id) => {
      const isSelected = id === lotId;
      polygon.setOptions({
        strokeWeight: isSelected ? 4 : 2.5,
        fillOpacity: isSelected ? 0.7 : 0.4
      });
    });
  };

  const initializeMap = async () => {
    if (!apiKey) {
      setError('API key de Google Maps requerida');
      return;
    }

    console.log('🗺️ Starting Google Maps initialization...');
    
    setIsLoading(true);
    setError(null);
    setShowApiKeyInput(false);

    if (!mapContainer.current) {
      console.error('❌ Map container not found');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Loading Google Maps API...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['geometry']
      });

      await loader.load();
      
      console.log('🌍 Creating Google Maps instance...');
      map.current = new google.maps.Map(mapContainer.current, {
        ...GOOGLE_MAPS_CONFIG,
        center: SKYRANCH_CENTER
      });

      setIsLoading(false);
      addSkyRanchLabel();
      addLotBoundaries();
      
      toast({
        title: "Map Loaded",
        description: "SkyRanch satellite map loaded with real lot boundaries!",
      });

    } catch (error) {
      console.error('❌ Google Maps initialization error:', error);
      setError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      setShowApiKeyInput(true);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the map. Please check your API key.",
        variant: "destructive"
      });
    }
  };

  const updateLotColor = (lotId: string, color: string) => {
    setLotColors(prev => ({ ...prev, [lotId]: color }));
    
    const polygon = polygons.current.get(lotId);
    if (polygon) {
      polygon.setOptions({ fillColor: color });
    }
  };

  const toggleLayer = (layerName: 'lots' | 'labels') => {
    if (layerName === 'lots') {
      polygons.current.forEach(polygon => {
        const visible = polygon.getVisible();
        polygon.setVisible(!visible);
      });
    } else if (layerName === 'labels') {
      labels.current.forEach(label => {
        const visible = label.getVisible();
        label.setVisible(!visible);
      });
    }
  };

  useEffect(() => {
    if (apiKey) {
      initializeMap();
    }
    return () => {
      console.log('🧹 Cleaning up Google Maps...');
      polygons.current.clear();
      labels.current.clear();
      if (skyranchLabel.current) {
        skyranchLabel.current.setMap(null);
      }
    };
  }, [apiKey]);

  // Update lot selection highlighting
  useEffect(() => {
    if (selectedLot) {
      updatePolygonHighlight(selectedLot);
    }
  }, [selectedLot]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    selectedLot,
    lotColors,
    apiKey,
    showApiKeyInput,
    setApiKey,
    initializeMap,
    updateLotColor,
    toggleLayer
  };
};

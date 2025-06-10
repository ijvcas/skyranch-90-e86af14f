
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';
import { SKYRANCH_CENTER, REAL_LOT_BOUNDARIES, LOT_COLORS, MAPBOX_TOKEN } from './mapConstants';

export const useMapInitialization = (
  lots: Lot[],
  onLotSelect: (lotId: string) => void
) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [lotColors, setLotColors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const addSkyRanchLabel = () => {
    if (!map.current) return;

    console.log('🏷️ Adding SKYRANCH label...');

    try {
      map.current.addSource('skyranch-label', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: 'SKYRANCH'
          },
          geometry: {
            type: 'Point',
            coordinates: SKYRANCH_CENTER
          }
        }
      });

      map.current.addLayer({
        id: 'skyranch-text',
        type: 'symbol',
        source: 'skyranch-label',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 28,
          'text-anchor': 'center',
          'text-offset': [0, -3]
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0, 0, 0, 0.9)',
          'text-halo-width': 4,
          'text-opacity': 1
        }
      });

      console.log('✅ SKYRANCH label added successfully');
    } catch (error) {
      console.error('❌ Error adding SKYRANCH label:', error);
    }
  };

  const addLotBoundaries = () => {
    if (!map.current) return;

    console.log('📍 Adding irregular lot boundaries...');

    try {
      map.current.addSource('lot-boundaries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: REAL_LOT_BOUNDARIES.map(boundary => ({
            type: 'Feature',
            properties: { 
              id: boundary.id,
              name: boundary.name,
              number: boundary.number,
              color: lotColors[boundary.id] || LOT_COLORS.default
            },
            geometry: {
              type: 'Polygon',
              coordinates: [boundary.coordinates]
            }
          }))
        }
      });

      // Add lot fill layer with better styling
      map.current.addLayer({
        id: 'lot-fills',
        type: 'fill',
        source: 'lot-boundaries',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedLot || ''], 0.7,
            0.4
          ]
        }
      });

      // Add lot border layer with enhanced styling
      map.current.addLayer({
        id: 'lot-borders',
        type: 'line',
        source: 'lot-boundaries',
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedLot || ''], 4,
            2.5
          ],
          'line-opacity': 0.95
        }
      });

      // Add lot number labels with better positioning
      map.current.addLayer({
        id: 'lot-labels',
        type: 'symbol',
        source: 'lot-boundaries',
        layout: {
          'text-field': ['get', 'number'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 20,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 3
        }
      });

      // Add click handlers
      map.current.on('click', 'lot-fills', (e) => {
        if (e.features && e.features[0]) {
          const lotId = e.features[0].properties?.id;
          if (lotId) {
            setSelectedLot(lotId);
            const matchingLot = lots.find(lot => lot.name.toLowerCase().includes(lotId.split('-')[1]));
            if (matchingLot) {
              onLotSelect(matchingLot.id);
            }
          }
        }
      });

      map.current.on('mouseenter', 'lot-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'lot-fills', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      console.log('✅ Irregular lot boundaries added successfully');
    } catch (error) {
      console.error('❌ Error adding lot boundaries:', error);
    }
  };

  const initializeMap = async () => {
    console.log('🗺️ Starting map initialization...');
    
    setIsLoading(true);
    setError(null);

    if (!mapContainer.current) {
      console.error('❌ Map container not found');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Setting Mapbox access token...');
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      console.log('🌍 Creating map instance with satellite view...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: SKYRANCH_CENTER,
        zoom: 18,
        pitch: 0,
        bearing: 0
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map loading failed. Please check your internet connection.`);
        setIsLoading(false);
        toast({
          title: "Map Error",
          description: "Failed to load the satellite map. Please try again.",
          variant: "destructive"
        });
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setIsLoading(false);
        addSkyRanchLabel();
        addLotBoundaries();
        toast({
          title: "Map Loaded",
          description: "SkyRanch satellite map loaded with real lot boundaries!",
        });
      });

      console.log('🎛️ Adding map controls...');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    } catch (error) {
      console.error('❌ Map initialization error:', error);
      setError(`Failed to initialize map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize the map. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateLotColor = (lotId: string, color: string) => {
    setLotColors(prev => ({ ...prev, [lotId]: color }));
    
    if (map.current && map.current.getSource('lot-boundaries')) {
      const source = map.current.getSource('lot-boundaries') as mapboxgl.GeoJSONSource;
      if (source && source.setData) {
        const currentFeatures = REAL_LOT_BOUNDARIES.map(boundary => ({
          type: 'Feature' as const,
          properties: { 
            id: boundary.id,
            name: boundary.name,
            number: boundary.number,
            color: boundary.id === lotId ? color : (lotColors[boundary.id] || LOT_COLORS.default)
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: [boundary.coordinates]
          }
        }));

        source.setData({
          type: 'FeatureCollection',
          features: currentFeatures
        });
      }
    }
  };

  const toggleLayer = (layerName: 'lots' | 'labels') => {
    if (!map.current) return;

    const layerId = layerName === 'lots' ? 'lot-fills' : 'lot-labels';
    const borderId = 'lot-borders';
    
    const currentVisibility = map.current.getLayoutProperty(layerId, 'visibility');
    const visibility = currentVisibility === 'none' ? 'visible' : 'none';
    
    map.current.setLayoutProperty(layerId, 'visibility', visibility);
    if (layerName === 'lots') {
      map.current.setLayoutProperty(borderId, 'visibility', visibility);
    }
  };

  useEffect(() => {
    initializeMap();
    return () => {
      console.log('🧹 Cleaning up map...');
      map.current?.remove();
    };
  }, []);

  // Update lot selection highlighting
  useEffect(() => {
    if (map.current && map.current.getLayer('lot-fills')) {
      map.current.setPaintProperty('lot-fills', 'fill-opacity', [
        'case',
        ['==', ['get', 'id'], selectedLot || ''], 0.7,
        0.4
      ]);
      map.current.setPaintProperty('lot-borders', 'line-width', [
        'case',
        ['==', ['get', 'id'], selectedLot || ''], 4,
        2.5
      ]);
    }
  }, [selectedLot]);

  return {
    mapContainer,
    map,
    isLoading,
    error,
    selectedLot,
    lotColors,
    initializeMap,
    updateLotColor,
    toggleLayer
  };
};

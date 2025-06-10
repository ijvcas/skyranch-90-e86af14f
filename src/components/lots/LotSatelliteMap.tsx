
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Settings, AlertCircle, Loader2, X, Palette } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

// SkyRanch coordinates from the images provided
const SKYRANCH_CENTER: [number, number] = [-4.474297, 40.317645]; // 4°28'27.47"W, 40°19'3.52"N

// Real lot divisions based on the aerial image layout
const REAL_LOT_BOUNDARIES = [
  {
    id: 'lot-1',
    name: 'Lote 1',
    number: 1,
    coordinates: [
      [-4.474850, 40.318100],
      [-4.474200, 40.318100],
      [-4.474200, 40.317800],
      [-4.474850, 40.317800],
      [-4.474850, 40.318100]
    ] as [number, number][]
  },
  {
    id: 'lot-2',
    name: 'Lote 2',
    number: 2,
    coordinates: [
      [-4.474200, 40.318100],
      [-4.473550, 40.318100],
      [-4.473550, 40.317800],
      [-4.474200, 40.317800],
      [-4.474200, 40.318100]
    ] as [number, number][]
  },
  {
    id: 'lot-3',
    name: 'Lote 3',
    number: 3,
    coordinates: [
      [-4.474850, 40.317800],
      [-4.474200, 40.317800],
      [-4.474200, 40.317500],
      [-4.474850, 40.317500],
      [-4.474850, 40.317800]
    ] as [number, number][]
  },
  {
    id: 'lot-4',
    name: 'Lote 4',
    number: 4,
    coordinates: [
      [-4.474200, 40.317800],
      [-4.473550, 40.317800],
      [-4.473550, 40.317500],
      [-4.474200, 40.317500],
      [-4.474200, 40.317800]
    ] as [number, number][]
  },
  {
    id: 'lot-5',
    name: 'Lote 5',
    number: 5,
    coordinates: [
      [-4.474850, 40.317500],
      [-4.474200, 40.317500],
      [-4.474200, 40.317200],
      [-4.474850, 40.317200],
      [-4.474850, 40.317500]
    ] as [number, number][]
  },
  {
    id: 'lot-6',
    name: 'Lote 6',
    number: 6,
    coordinates: [
      [-4.474200, 40.317500],
      [-4.473550, 40.317500],
      [-4.473550, 40.317200],
      [-4.474200, 40.317200],
      [-4.474200, 40.317500]
    ] as [number, number][]
  },
  {
    id: 'lot-7',
    name: 'Lote 7',
    number: 7,
    coordinates: [
      [-4.473550, 40.318100],
      [-4.472900, 40.318100],
      [-4.472900, 40.317200],
      [-4.473550, 40.317200],
      [-4.473550, 40.318100]
    ] as [number, number][]
  }
];

// Color palette for lot management
const LOT_COLORS = {
  grazing: '#10b981', // Green
  resting: '#f59e0b',  // Amber
  maintenance: '#ef4444', // Red
  preparation: '#8b5cf6', // Purple
  reserved: '#06b6d4', // Cyan
  default: '#6b7280' // Gray
};

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState({
    lots: true,
    labels: true
  });
  const [showControls, setShowControls] = useState(true);
  const [lotColors, setLotColors] = useState<Record<string, string>>({});
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const { toast } = useToast();

  // Use a demo token - in production, this should come from environment variables
  const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

  const initializeMap = async () => {
    console.log('🗺️ Starting map initialization...');
    
    setIsLoading(true);
    setError(null);

    // Wait a bit to ensure the container is rendered
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!mapContainer.current) {
      console.error('❌ Map container not found after waiting');
      setError('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔑 Setting Mapbox access token...');
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      console.log('🌍 Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: SKYRANCH_CENTER,
        zoom: 17.5,
        pitch: 0,
        bearing: 0
      });

      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map failed to load: ${e.error?.message || 'Unknown error'}`);
        setIsLoading(false);
        toast({
          title: "Map Error",
          description: "Failed to load the satellite map.",
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
          description: "Satellite map loaded successfully!",
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

  const addSkyRanchLabel = () => {
    if (!map.current) return;

    console.log('🏷️ Adding SKYRANCH label...');

    try {
      // Add SKYRANCH source
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

      // Add SKYRANCH label layer
      map.current.addLayer({
        id: 'skyranch-text',
        type: 'symbol',
        source: 'skyranch-label',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 24,
          'text-anchor': 'center',
          'text-offset': [0, -2]
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': 'rgba(0, 0, 0, 0.8)',
          'text-halo-width': 3,
          'text-opacity': 0.9
        }
      });

      console.log('✅ SKYRANCH label added successfully');
    } catch (error) {
      console.error('❌ Error adding SKYRANCH label:', error);
    }
  };

  const addLotBoundaries = () => {
    if (!map.current) {
      console.warn('⚠️ Cannot add lot boundaries: map not available');
      return;
    }

    console.log('📍 Adding lot boundaries...');

    try {
      // Add lot boundary source
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

      // Add lot fill layer
      map.current.addLayer({
        id: 'lot-fills',
        type: 'fill',
        source: 'lot-boundaries',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': [
            'case',
            ['==', ['get', 'id'], selectedLot || ''], 0.6,
            0.3
          ]
        }
      });

      // Add lot border layer
      map.current.addLayer({
        id: 'lot-borders',
        type: 'line',
        source: 'lot-boundaries',
        paint: {
          'line-color': '#ffffff',
          'line-width': [
            'case',
            ['==', ['get', 'id'], selectedLot || ''], 3,
            2
          ],
          'line-opacity': 0.9
        }
      });

      // Add lot number labels
      map.current.addLayer({
        id: 'lot-labels',
        type: 'symbol',
        source: 'lot-boundaries',
        layout: {
          'text-field': ['get', 'number'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 18,
          'text-anchor': 'center'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 2
        }
      });

      // Add click handlers
      map.current.on('click', 'lot-fills', (e) => {
        if (e.features && e.features[0]) {
          const lotId = e.features[0].properties?.id;
          if (lotId) {
            setSelectedLot(lotId);
            // Find matching lot in the lots array and select it
            const matchingLot = lots.find(lot => lot.name.toLowerCase().includes(lotId.split('-')[1]));
            if (matchingLot) {
              onLotSelect(matchingLot.id);
            }
          }
        }
      });

      // Change cursor on hover
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

      console.log('✅ Lot boundaries added successfully');
    } catch (error) {
      console.error('❌ Error adding lot boundaries:', error);
    }
  };

  const updateLotColor = (lotId: string, color: string) => {
    setLotColors(prev => ({ ...prev, [lotId]: color }));
    
    if (map.current && map.current.getSource('lot-boundaries')) {
      // Update the source data with new color
      const currentData = map.current.getSource('lot-boundaries')._data;
      const updatedFeatures = currentData.features.map((feature: any) => {
        if (feature.properties.id === lotId) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              color: color
            }
          };
        }
        return feature;
      });

      map.current.getSource('lot-boundaries').setData({
        type: 'FeatureCollection',
        features: updatedFeatures
      });
    }
  };

  const toggleLayer = (layerName: keyof typeof selectedLayers) => {
    setSelectedLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
    
    if (!map.current) return;

    const visibility = selectedLayers[layerName] ? 'none' : 'visible';
    
    switch (layerName) {
      case 'lots':
        map.current.setLayoutProperty('lot-fills', 'visibility', visibility);
        map.current.setLayoutProperty('lot-borders', 'visibility', visibility);
        break;
      case 'labels':
        map.current.setLayoutProperty('lot-labels', 'visibility', visibility);
        break;
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
        ['==', ['get', 'id'], selectedLot || ''], 0.6,
        0.3
      ]);
      map.current.setPaintProperty('lot-borders', 'line-width', [
        'case',
        ['==', ['get', 'id'], selectedLot || ''], 3,
        2
      ]);
    }
  }, [selectedLot]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container - Full Screen */}
      <div 
        ref={mapContainer} 
        className="w-full h-[calc(100vh-8rem)]" 
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center bg-background p-6 rounded-lg shadow-lg border">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Cargando mapa satelital...</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-40 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center bg-background p-6 rounded-lg shadow-lg border">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-red-800 mb-3">{error}</p>
            <Button onClick={initializeMap} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Floating Controls */}
      {!isLoading && !error && (
        <>
          {/* Controls Toggle Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-4 left-4 z-30 shadow-lg"
            onClick={() => setShowControls(!showControls)}
          >
            {showControls ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </Button>

          {/* Layer Controls */}
          {showControls && (
            <Card className="absolute top-4 left-16 z-30 shadow-lg max-w-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  SkyRanch - Gestión de Lotes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLayer('lots')}
                    className={selectedLayers.lots ? 'bg-green-50' : ''}
                  >
                    <Layers className="w-4 h-4 mr-1" />
                    Lotes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLayer('labels')}
                    className={selectedLayers.labels ? 'bg-blue-50' : ''}
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Números
                  </Button>
                </div>
                
                {selectedLot && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">
                      Lote {REAL_LOT_BOUNDARIES.find(l => l.id === selectedLot)?.number} - Color:
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.entries(LOT_COLORS).map(([key, color]) => (
                        <button
                          key={key}
                          className="w-8 h-8 rounded border-2 border-white shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => updateLotColor(selectedLot, color)}
                          title={key}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Legend */}
          {showControls && (
            <Card className="absolute bottom-4 left-4 z-30 shadow-lg">
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-green-50">
                    <div className="w-2 h-2 bg-green-500 rounded mr-1"></div>
                    Pastoreo
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50">
                    <div className="w-2 h-2 bg-yellow-500 rounded mr-1"></div>
                    Descanso
                  </Badge>
                  <Badge variant="outline" className="bg-red-50">
                    <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>
                    Mantenimiento
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50">
                    <div className="w-2 h-2 bg-purple-500 rounded mr-1"></div>
                    Preparación
                  </Badge>
                  <Badge variant="outline" className="bg-cyan-50">
                    <div className="w-2 h-2 bg-cyan-500 rounded mr-1"></div>
                    Reservado
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coordinates Info */}
          <div className="absolute bottom-4 right-4 z-30 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-lg border shadow-lg">
            <p className="text-xs text-muted-foreground">
              SkyRanch - 40°19'3.52"N, 4°28'27.47"W
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LotSatelliteMap;


import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Layers, Home, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { useToast } from '@/hooks/use-toast';

interface LotSatelliteMapProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

// SkyRanch coordinates from the images provided
const SKYRANCH_CENTER: [number, number] = [-4.474297, 40.317645]; // 4°28'27.47"W, 40°19'3.52"N
const ANIMAL_SHEDS = [
  { name: 'Cobertizo Norte', coordinates: [-4.474200, 40.317700] as [number, number] },
  { name: 'Cobertizo Sur', coordinates: [-4.474400, 40.317600] as [number, number] }
];

// Example lot boundaries based on the aerial image layout
const EXAMPLE_LOT_BOUNDARIES = [
  {
    id: 'lot-1',
    name: 'Lote Norte',
    coordinates: [
      [-4.474800, 40.318000],
      [-4.473800, 40.318000],
      [-4.473800, 40.317700],
      [-4.474800, 40.317700],
      [-4.474800, 40.318000]
    ] as [number, number][]
  },
  {
    id: 'lot-2',
    name: 'Lote Central',
    coordinates: [
      [-4.474800, 40.317700],
      [-4.473800, 40.317700],
      [-4.473800, 40.317400],
      [-4.474800, 40.317400],
      [-4.474800, 40.317700]
    ] as [number, number][]
  },
  {
    id: 'lot-3',
    name: 'Lote Sur',
    coordinates: [
      [-4.474800, 40.317400],
      [-4.473800, 40.317400],
      [-4.473800, 40.317100],
      [-4.474800, 40.317100],
      [-4.474800, 40.317400]
    ] as [number, number][]
  },
  {
    id: 'lot-4',
    name: 'Lote Este',
    coordinates: [
      [-4.473800, 40.318000],
      [-4.473300, 40.318000],
      [-4.473300, 40.317100],
      [-4.473800, 40.317100],
      [-4.473800, 40.318000]
    ] as [number, number][]
  }
];

const LotSatelliteMap = ({ lots, onLotSelect }: LotSatelliteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayers, setSelectedLayers] = useState({
    lots: true,
    sheds: true,
    boundaries: true
  });
  const { toast } = useToast();

  const validateToken = (token: string): boolean => {
    if (!token) {
      setError('Token is required');
      return false;
    }
    
    if (!token.startsWith('pk.')) {
      setError('Invalid token format. Mapbox public tokens start with "pk."');
      return false;
    }
    
    if (token.length < 20) {
      setError('Token appears to be too short');
      return false;
    }
    
    return true;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'resting': return '#f59e0b'; // yellow
      case 'maintenance': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const initializeMap = async () => {
    console.log('🗺️ Starting map initialization...');
    
    if (!mapContainer.current) {
      console.error('❌ Map container not found');
      setError('Map container not available');
      return;
    }

    if (!validateToken(mapboxToken)) {
      console.error('❌ Token validation failed');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔑 Setting Mapbox access token...');
      mapboxgl.accessToken = mapboxToken;
      
      console.log('🌍 Creating map instance...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: SKYRANCH_CENTER,
        zoom: 17,
        pitch: 0,
        bearing: 0
      });

      // Add error handler for map load failures
      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map failed to load: ${e.error?.message || 'Unknown error'}`);
        setIsLoading(false);
        toast({
          title: "Map Error",
          description: "Failed to load the satellite map. Please check your token and try again.",
          variant: "destructive"
        });
      });

      // Add success handler
      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setIsLoading(false);
        setShowTokenInput(false);
        addLotBoundaries();
        addAnimalSheds();
        addPropertyBoundary();
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
          features: EXAMPLE_LOT_BOUNDARIES.map(boundary => ({
            type: 'Feature',
            properties: { 
              id: boundary.id,
              name: boundary.name,
              status: 'active' // Default status
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
          'fill-color': [
            'case',
            ['==', ['get', 'status'], 'active'], '#10b981',
            ['==', ['get', 'status'], 'resting'], '#f59e0b',
            ['==', ['get', 'status'], 'maintenance'], '#ef4444',
            '#6b7280'
          ],
          'fill-opacity': 0.3
        }
      });

      // Add lot border layer
      map.current.addLayer({
        id: 'lot-borders',
        type: 'line',
        source: 'lot-boundaries',
        paint: {
          'line-color': '#ffffff',
          'line-width': 2,
          'line-opacity': 0.8
        }
      });

      // Add lot labels
      map.current.addLayer({
        id: 'lot-labels',
        type: 'symbol',
        source: 'lot-boundaries',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 14,
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

  const addAnimalSheds = () => {
    if (!map.current) {
      console.warn('⚠️ Cannot add animal sheds: map not available');
      return;
    }

    console.log('🏠 Adding animal sheds...');

    try {
      ANIMAL_SHEDS.forEach((shed, index) => {
        // Create a custom marker element
        const el = document.createElement('div');
        el.className = 'shed-marker';
        el.style.cssText = `
          background-color: #3b82f6;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Add icon
        const icon = document.createElement('div');
        icon.innerHTML = '🏠';
        icon.style.fontSize = '14px';
        el.appendChild(icon);

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(shed.coordinates)
          .addTo(map.current!);

        // Add popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${shed.name}</h3>
              <p class="text-sm text-gray-600">Instalación para animales</p>
            </div>
          `);

        marker.setPopup(popup);
      });

      console.log('✅ Animal sheds added successfully');
    } catch (error) {
      console.error('❌ Error adding animal sheds:', error);
    }
  };

  const addPropertyBoundary = () => {
    if (!map.current) {
      console.warn('⚠️ Cannot add property boundary: map not available');
      return;
    }

    console.log('🏡 Adding property boundary...');

    try {
      // Add approximate property boundary based on the aerial view
      const propertyBoundary: [number, number][] = [
        [-4.475200, 40.318200],
        [-4.473000, 40.318200],
        [-4.473000, 40.316900],
        [-4.475200, 40.316900],
        [-4.475200, 40.318200]
      ];

      map.current.addSource('property-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [propertyBoundary]
          }
        }
      });

      map.current.addLayer({
        id: 'property-border',
        type: 'line',
        source: 'property-boundary',
        paint: {
          'line-color': '#dc2626',
          'line-width': 3,
          'line-dasharray': [2, 2]
        }
      });

      console.log('✅ Property boundary added successfully');
    } catch (error) {
      console.error('❌ Error adding property boundary:', error);
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
        map.current.setLayoutProperty('lot-labels', 'visibility', visibility);
        break;
      case 'boundaries':
        map.current.setLayoutProperty('property-border', 'visibility', visibility);
        break;
    }
  };

  const handleRetry = () => {
    console.log('🔄 Retrying map initialization...');
    setError(null);
    setIsLoading(false);
    map.current?.remove();
    map.current = null;
  };

  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up map...');
      map.current?.remove();
    };
  }, []);

  if (showTokenInput) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Configurar Mapa Satelital
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center p-3 text-sm text-red-800 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Para mostrar el mapa satelital de SkyRanch, necesitas proporcionar tu token público de Mapbox.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Token Público de Mapbox</label>
              <Input
                type="text"
                value={mapboxToken}
                onChange={(e) => {
                  setMapboxToken(e.target.value);
                  setError(null); // Clear error when user types
                }}
                placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja..."
                className="font-mono text-sm"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Obtén tu token en{' '}
              <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                mapbox.com
              </a>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={initializeMap} 
              disabled={!mapboxToken || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando Mapa...
                </>
              ) : (
                'Cargar Mapa'
              )}
            </Button>
            
            {error && (
              <Button 
                onClick={handleRetry}
                variant="outline"
                disabled={isLoading}
              >
                Reintentar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Mapa Satelital de SkyRanch
            </span>
            <div className="flex items-center space-x-2">
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
                onClick={() => toggleLayer('sheds')}
                className={selectedLayers.sheds ? 'bg-blue-50' : ''}
              >
                <Home className="w-4 h-4 mr-1" />
                Cobertizos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLayer('boundaries')}
                className={selectedLayers.boundaries ? 'bg-red-50' : ''}
              >
                <Settings className="w-4 h-4 mr-1" />
                Límites
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowTokenInput(true);
                  map.current?.remove();
                  map.current = null;
                }}
              >
                <Settings className="w-4 h-4 mr-1" />
                Cambiar Token
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-green-50">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              Lotes Activos
            </Badge>
            <Badge variant="outline" className="bg-yellow-50">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              En Descanso
            </Badge>
            <Badge variant="outline" className="bg-red-50">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              Mantenimiento
            </Badge>
            <Badge variant="outline" className="bg-blue-50">
              🏠 Cobertizos
            </Badge>
          </div>
          
          {isLoading && (
            <div className="w-full h-96 rounded-lg border flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-gray-600">Cargando mapa satelital...</p>
              </div>
            </div>
          )}
          
          {error && !isLoading && (
            <div className="w-full h-96 rounded-lg border flex items-center justify-center bg-red-50">
              <div className="text-center p-4">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-red-800 mb-3">{error}</p>
                <Button onClick={handleRetry} variant="outline" size="sm">
                  Reintentar
                </Button>
              </div>
            </div>
          )}
          
          <div 
            ref={mapContainer} 
            className={`w-full h-96 rounded-lg border ${isLoading || error ? 'hidden' : ''}`} 
          />
          
          <p className="text-xs text-gray-500 mt-2">
            Coordenadas: 40°19'3.52"N, 4°28'27.47"W - Haz clic en los lotes para ver detalles
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LotSatelliteMap;

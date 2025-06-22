import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Upload, FileText, AlertTriangle } from 'lucide-react';
import PropertySelector from './PropertySelector';
import CadastralFileUpload from './CadastralFileUpload';
import { getAllProperties, getCadastralParcels, type Property, type CadastralParcel } from '@/services/cadastralService';
import { useGoogleMapsLoader } from '@/hooks/polygon/useGoogleMapsLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CadastralMapViewProps {
  onPropertySelect?: (propertyId: string) => void;
}

const CadastralMapView: React.FC<CadastralMapViewProps> = ({ onPropertySelect }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [cadastralParcels, setCadastralParcels] = useState<CadastralParcel[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [cadastralPolygons, setCadastralPolygons] = useState<google.maps.Polygon[]>([]);

  const { isLoaded, loadError } = useGoogleMapsLoader();

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load cadastral parcels when property changes
  useEffect(() => {
    if (selectedPropertyId) {
      loadCadastralParcels(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  // Initialize map when Google Maps is loaded and we have a selected property
  useEffect(() => {
    if (isLoaded && selectedPropertyId && !map) {
      initializeMap();
    }
  }, [isLoaded, selectedPropertyId, map]);

  // Display cadastral parcels on map when data changes
  useEffect(() => {
    if (map && cadastralParcels.length > 0) {
      displayCadastralParcels();
    }
  }, [map, cadastralParcels]);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProperties();
      setProperties(data);
      
      // Auto-select main property if available
      const mainProperty = data.find(p => p.isMainProperty);
      if (mainProperty && !selectedPropertyId) {
        setSelectedPropertyId(mainProperty.id);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCadastralParcels = async (propertyId: string) => {
    try {
      const data = await getCadastralParcels(propertyId);
      setCadastralParcels(data);
    } catch (error) {
      console.error('Error loading cadastral parcels:', error);
    }
  };

  const initializeMap = () => {
    const selectedProperty = properties.find(p => p.id === selectedPropertyId);
    if (!selectedProperty) return;

    const mapElement = document.getElementById('cadastral-map');
    if (!mapElement) return;

    const newMap = new google.maps.Map(mapElement, {
      center: { 
        lat: selectedProperty.centerLat, 
        lng: selectedProperty.centerLng 
      },
      zoom: selectedProperty.zoomLevel || 16,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
      },
    });

    setMap(newMap);
  };

  const displayCadastralParcels = () => {
    if (!map) return;

    // Clear existing polygons
    cadastralPolygons.forEach(polygon => polygon.setMap(null));
    setCadastralPolygons([]);

    const newPolygons: google.maps.Polygon[] = [];

    cadastralParcels.forEach(parcel => {
      if (parcel.boundaryCoordinates && parcel.boundaryCoordinates.length > 0) {
        const polygon = new google.maps.Polygon({
          paths: parcel.boundaryCoordinates,
          fillColor: '#FFD700', // Gold color for cadastral parcels
          fillOpacity: 0.3,
          strokeColor: '#FFA500', // Orange border
          strokeWeight: 2,
          clickable: true,
          editable: false, // Cadastral parcels are read-only
        });

        polygon.setMap(map);

        // Add info window for parcel details
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${parcel.parcelId}</h3>
              ${parcel.areaHectares ? `<p>Área: ${parcel.areaHectares.toFixed(2)} ha</p>` : ''}
              ${parcel.classification ? `<p>Clasificación: ${parcel.classification}</p>` : ''}
              ${parcel.ownerInfo ? `<p>Propietario: ${parcel.ownerInfo}</p>` : ''}
              ${parcel.notes ? `<p>Notas: ${parcel.notes}</p>` : ''}
            </div>
          `
        });

        polygon.addListener('click', (event: google.maps.MapMouseEvent) => {
          infoWindow.setPosition(event.latLng);
          infoWindow.open(map);
        });

        newPolygons.push(polygon);
      }
    });

    setCadastralPolygons(newPolygons);
  };

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setMap(null); // Reset map to reinitialize with new property
    onPropertySelect?.(propertyId);
  };

  const handleFileUploadSuccess = () => {
    // Reload cadastral parcels after successful upload
    if (selectedPropertyId) {
      loadCadastralParcels(selectedPropertyId);
    }
    setShowUpload(false);
  };

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error cargando Google Maps. Por favor, verifica tu conexión a internet.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Cargando mapa cadastral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Property Selection and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Mapa Cadastral</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PropertySelector
              properties={properties}
              selectedPropertyId={selectedPropertyId}
              onPropertyChange={handlePropertyChange}
              isLoading={isLoading}
            />
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowUpload(!showUpload)}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Importar XML/KML</span>
              </Button>
            </div>
          </div>

          {showUpload && (
            <CadastralFileUpload
              propertyId={selectedPropertyId}
              onSuccess={handleFileUploadSuccess}
              onCancel={() => setShowUpload(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Map Display */}
      <Card>
        <CardContent className="p-0">
          <div 
            id="cadastral-map" 
            className="w-full h-96 rounded-lg"
            style={{ minHeight: '600px' }}
          />
        </CardContent>
      </Card>

      {/* Cadastral Parcels Info */}
      {cadastralParcels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Parcelas Catastrales ({cadastralParcels.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cadastralParcels.map(parcel => (
                <div key={parcel.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold">{parcel.parcelId}</h4>
                  {parcel.areaHectares && (
                    <p className="text-sm text-gray-600">
                      Área: {parcel.areaHectares.toFixed(2)} ha
                    </p>
                  )}
                  {parcel.classification && (
                    <p className="text-sm text-gray-600">
                      Clasificación: {parcel.classification}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CadastralMapView;

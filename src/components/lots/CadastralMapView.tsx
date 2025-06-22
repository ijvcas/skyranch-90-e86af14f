
import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getAllProperties, getCadastralParcels, updateCadastralParcel, type Property, type CadastralParcel } from '@/services/cadastralService';
import { useGoogleMapsLoader } from '@/hooks/polygon/useGoogleMapsLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CadastralMapControls from './CadastralMapControls';
import CadastralMap from './CadastralMap';
import EditableParcelsList from './EditableParcelsList';
import type { ParcelStatus } from '@/utils/cadastral/types';
import { toast } from 'sonner';

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
  const [statusFilter, setStatusFilter] = useState<ParcelStatus | 'ALL'>('ALL');

  const { isLoaded, loadError } = useGoogleMapsLoader();

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      loadCadastralParcels(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const loadProperties = async () => {
    setIsLoading(true);
    try {
      const data = await getAllProperties();
      setProperties(data);
      
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
      console.log(`📋 Loaded ${data.length} cadastral parcels`);
    } catch (error) {
      console.error('Error loading cadastral parcels:', error);
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setMap(null);
    onPropertySelect?.(propertyId);
  };

  const handleFileUploadSuccess = () => {
    if (selectedPropertyId) {
      loadCadastralParcels(selectedPropertyId);
    }
    setShowUpload(false);
  };

  const handleMapReady = (newMap: google.maps.Map) => {
    setMap(newMap);
  };

  const handleParcelUpdate = async (parcelId: string, updates: Partial<CadastralParcel>) => {
    try {
      const success = await updateCadastralParcel(parcelId, updates);
      if (success) {
        // Update local state
        setCadastralParcels(prev => 
          prev.map(parcel => 
            parcel.id === parcelId 
              ? { ...parcel, ...updates }
              : parcel
          )
        );
        toast.success('Parcela actualizada correctamente');
      } else {
        toast.error('Error al actualizar la parcela');
      }
    } catch (error) {
      console.error('Error updating parcel:', error);
      toast.error('Error al actualizar la parcela');
    }
  };

  const handleParcelClick = (parcel: CadastralParcel) => {
    // FIXED: Focus on the parcel without disrupting the main map view
    if (map && parcel.boundaryCoordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      parcel.boundaryCoordinates.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });
      
      // Only fit bounds if the parcel is reasonably sized and not too small
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latDiff = Math.abs(ne.lat() - sw.lat());
      const lngDiff = Math.abs(ne.lng() - sw.lng());
      
      if (latDiff > 0.0001 && lngDiff > 0.0001) {
        map.fitBounds(bounds);
        // Prevent over-zooming
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom();
          if (zoom && zoom > 20) {
            map.setZoom(20);
          }
        });
      } else {
        // For very small parcels, just center on them
        const center = bounds.getCenter();
        map.setCenter(center);
        map.setZoom(18);
      }
    }
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

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

  return (
    <div className="space-y-6">
      <CadastralMapControls
        properties={properties}
        selectedPropertyId={selectedPropertyId}
        onPropertyChange={handlePropertyChange}
        isLoading={isLoading}
        showUpload={showUpload}
        onToggleUpload={() => setShowUpload(!showUpload)}
        onFileUploadSuccess={handleFileUploadSuccess}
        onCancelUpload={() => setShowUpload(false)}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <CadastralMap
        isLoaded={isLoaded}
        selectedProperty={selectedProperty}
        cadastralParcels={cadastralParcels}
        statusFilter={statusFilter}
        onMapReady={handleMapReady}
        onParcelClick={handleParcelClick}
      />

      <EditableParcelsList
        parcels={cadastralParcels}
        onParcelUpdate={handleParcelUpdate}
        onParcelClick={handleParcelClick}
      />
    </div>
  );
};

export default CadastralMapView;

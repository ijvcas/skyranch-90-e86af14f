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
import { batchUpdateAllParcels } from '@/services/cadastral/batchProcessor';
import { updatePropertyCenterToCalculatedCenter } from '@/services/cadastral/coordinateCalculator';

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
      console.log('🗺️ Loading cadastral parcels with CORRECTED SkyRanch coordinates...');
      
      // Load parcels directly - coordinates are already corrected in database
      const data = await getCadastralParcels(propertyId);
      setCadastralParcels(data);
      console.log(`📋 Loaded ${data.length} cadastral parcels at CORRECTED SkyRanch location`);
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

  const calculateParcelCenter = (coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } => {
    if (!coordinates || coordinates.length === 0) {
      console.warn('⚠️ No coordinates provided for center calculation');
      // Use the property center as fallback
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      return selectedProperty ? 
        { lat: selectedProperty.centerLat, lng: selectedProperty.centerLng } :
        { lat: 40.317635, lng: -4.474248 }; // CORRECTED SkyRanch fallback coordinates
    }

    // CORRECTED: Use updated coordinate validation bounds for SkyRanch
    const validCoords = coordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      coord.lat >= 40.315 && coord.lat <= 40.320 && 
      coord.lng >= -4.478 && coord.lng <= -4.470
    );

    if (validCoords.length === 0) {
      console.warn('⚠️ No valid coordinates after filtering');
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      return selectedProperty ? 
        { lat: selectedProperty.centerLat, lng: selectedProperty.centerLng } :
        { lat: 40.317635, lng: -4.474248 }; // CORRECTED SkyRanch fallback coordinates
    }

    const latSum = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
    
    const center = {
      lat: latSum / validCoords.length,
      lng: lngSum / validCoords.length
    };

    console.log(`📍 Calculated parcel center at CORRECTED SkyRanch location: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)} from ${validCoords.length} valid coords`);
    return center;
  };

  const handleParcelClick = (parcel: CadastralParcel) => {
    if (map && parcel.boundaryCoordinates.length > 0) {
      console.log(`🎯 Focusing on parcel at CORRECTED SkyRanch location: ${parcel.parcelId}`);
      
      const center = calculateParcelCenter(parcel.boundaryCoordinates);
      
      // CORRECTED: Validate calculated center is within SkyRanch bounds
      const isValidCenter = center.lat >= 40.315 && center.lat <= 40.320 && 
                           center.lng >= -4.478 && center.lng <= -4.470;
      
      if (isValidCenter) {
        console.log(`🎯 Centering map on parcel at CORRECTED SkyRanch location: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        
        map.setCenter(center);
        map.setZoom(20); // Higher zoom to see individual parcel clearly with WHITE numbers
        
        console.log(`✅ Successfully focused on parcel at CORRECTED SkyRanch location: ${parcel.parcelId}`);
      } else {
        console.warn(`⚠️ Calculated parcel center outside SkyRanch bounds: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        
        // Fallback to property center
        const selectedProperty = properties.find(p => p.id === selectedPropertyId);
        if (selectedProperty) {
          map.setCenter({ lat: selectedProperty.centerLat, lng: selectedProperty.centerLng });
          map.setZoom(18);
        }
        toast.error('Centro de parcela inválido, usando ubicación central');
      }
    } else {
      console.warn(`❌ Cannot focus on parcel: no map or coordinates for ${parcel.parcelId}`);
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

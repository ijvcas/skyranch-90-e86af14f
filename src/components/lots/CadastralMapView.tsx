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
import '@/services/cadastral/propertyUpdater';

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
      // FIXED: Run batch update first to ensure all parcels have sequential lot numbers 1-41
      console.log('🔄 Running batch update to ensure sequential numbering 1-41...');
      await batchUpdateAllParcels(propertyId);
      
      const data = await getCadastralParcels(propertyId);
      setCadastralParcels(data);
      console.log(`📋 Loaded ${data.length} cadastral parcels with sequential numbering 1-${data.length}`);
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
      return { lat: 40.101, lng: -4.470 }; // CORRECTED SkyRanch center
    }

    // FIXED: Use correct SkyRanch coordinate validation
    const validCoords = coordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      coord.lat >= 40.099 && coord.lat <= 40.103 && 
      coord.lng >= -4.475 && coord.lng <= -4.465
    );

    if (validCoords.length === 0) {
      console.warn('⚠️ No valid coordinates after filtering');
      return { lat: 40.101, lng: -4.470 }; // CORRECTED SkyRanch center
    }

    const latSum = validCoords.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = validCoords.reduce((sum, coord) => sum + coord.lng, 0);
    
    const center = {
      lat: latSum / validCoords.length,
      lng: lngSum / validCoords.length
    };

    console.log(`📍 Calculated parcel center: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)} from ${validCoords.length} valid coords`);
    return center;
  };

  const handleParcelClick = (parcel: CadastralParcel) => {
    if (map && parcel.boundaryCoordinates.length > 0) {
      console.log(`🎯 Focusing on parcel: ${parcel.parcelId}`);
      
      // FIXED: Use improved center calculation with correct validation bounds
      const center = calculateParcelCenter(parcel.boundaryCoordinates);
      
      // FIXED: Validate calculated center is within correct SkyRanch bounds
      const isValidCenter = center.lat >= 40.099 && center.lat <= 40.103 && 
                           center.lng >= -4.475 && center.lng <= -4.465;
      
      if (isValidCenter) {
        console.log(`🎯 Centering map on parcel at: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        
        // FIXED: Use setCenter and appropriate zoom for individual parcel viewing
        map.setCenter(center);
        map.setZoom(18); // Higher zoom to see individual parcel clearly with WHITE numbers
        
        console.log(`✅ Successfully focused on parcel: ${parcel.parcelId}`);
      } else {
        console.warn(`⚠️ Calculated parcel center outside SkyRanch bounds: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
        console.warn(`⚠️ Using corrected SkyRanch center as fallback`);
        
        // Fallback to corrected SkyRanch center
        map.setCenter({ lat: 40.101, lng: -4.470 });
        map.setZoom(16);
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

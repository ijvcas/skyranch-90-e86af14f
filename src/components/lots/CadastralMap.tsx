
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Property, CadastralParcel } from '@/services/cadastralService';
import { ParcelStatus } from '@/utils/cadastral/types';
import { initializeMap } from './cadastral-map/MapInitializer';
import { ParcelRenderer } from './cadastral-map/ParcelRenderer';

interface CadastralMapProps {
  isLoaded: boolean;
  selectedProperty: Property | undefined;
  cadastralParcels: CadastralParcel[];
  statusFilter: ParcelStatus | 'ALL';
  onMapReady: (map: google.maps.Map) => void;
  onParcelClick: (parcel: CadastralParcel) => void;
}

const CadastralMap: React.FC<CadastralMapProps> = ({
  isLoaded,
  selectedProperty,
  cadastralParcels,
  statusFilter,
  onMapReady,
  onParcelClick
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const parcelRendererRef = useRef<ParcelRenderer | null>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (isLoaded && selectedProperty && !mapRef.current) {
      const map = initializeMap(selectedProperty, 'cadastral-map', onMapReady);
      if (map) {
        mapRef.current = map;
        parcelRendererRef.current = new ParcelRenderer(map, onParcelClick);
        setInitialLoadComplete(true);
      }
    }
  }, [isLoaded, selectedProperty, onMapReady, onParcelClick]);

  useEffect(() => {
    if (mapRef.current && parcelRendererRef.current && cadastralParcels.length > 0 && initialLoadComplete) {
      console.log(`Displaying ${cadastralParcels.length} cadastral parcels on map`);
      displayCadastralParcels();
    }
  }, [cadastralParcels, statusFilter, initialLoadComplete]);

  const displayCadastralParcels = () => {
    if (!parcelRendererRef.current) {
      console.log('No parcel renderer available');
      return;
    }

    // FIXED: Always clear existing polygons first to prevent duplicates
    console.log('🧹 Clearing existing polygons before rendering new ones');
    parcelRendererRef.current.clearAll();

    // Filter parcels based on status
    const filteredParcels = statusFilter === 'ALL' 
      ? cadastralParcels 
      : cadastralParcels.filter(parcel => parcel.status === statusFilter);

    console.log(`Processing ${filteredParcels.length} filtered cadastral parcels`);
    
    let validParcels = 0;

    filteredParcels.forEach((parcel, index) => {
      console.log(`Creating polygon for parcel ${index + 1}: ${parcel.parcelId}`);
      
      // FIXED: Don't use bounds for auto-fitting to prevent map jumping
      const bounds = new google.maps.LatLngBounds();
      if (parcelRendererRef.current?.renderParcel(parcel, bounds)) {
        validParcels++;
      }
    });

    console.log(`Successfully displayed ${validParcels} out of ${filteredParcels.length} filtered parcels`);
    
    // REMOVED: Auto-bounds fitting that was causing map to jump to wrong locations
    // The map should stay centered on SkyRanch and users can zoom/pan manually
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div 
          id="cadastral-map" 
          className="w-full h-96 rounded-lg"
          style={{ minHeight: '600px' }}
        />
      </CardContent>
    </Card>
  );
};

export default CadastralMap;

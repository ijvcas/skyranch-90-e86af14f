
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
    const bounds = new google.maps.LatLngBounds();
    let hasParcelsInBounds = false;

    filteredParcels.forEach((parcel, index) => {
      console.log(`Creating polygon for parcel ${index + 1}: ${parcel.parcelId}`);
      
      if (parcelRendererRef.current?.renderParcel(parcel, bounds)) {
        validParcels++;
        hasParcelsInBounds = true;
      }
    });

    console.log(`Successfully displayed ${validParcels} out of ${filteredParcels.length} filtered parcels`);

    // FIXED: Only fit bounds if we have valid parcels AND it's not the initial load
    // This prevents the map from auto-zooming away from SkyRanch on first load
    if (!bounds.isEmpty() && validParcels > 0 && mapRef.current && hasParcelsInBounds) {
      console.log('📍 Fitting map to bounds of parcels');
      
      // Check if we should auto-fit or maintain current view
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom && currentZoom < 14) {
        // Only auto-fit if we're zoomed out too far
        mapRef.current.fitBounds(bounds);
        
        google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
          const zoom = mapRef.current?.getZoom();
          if (zoom && zoom > 18) {
            mapRef.current?.setZoom(18);
          }
        });
      }
    } else {
      console.log('📍 Keeping current map view centered on SkyRanch');
    }
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

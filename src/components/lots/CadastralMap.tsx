
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
  const [parcelsRendered, setParcelsRendered] = useState(false);

  useEffect(() => {
    if (isLoaded && selectedProperty && !mapRef.current) {
      console.log('🗺️ Initializing map with coordinates:', selectedProperty.centerLat, selectedProperty.centerLng);
      
      const map = initializeMap(selectedProperty, 'cadastral-map', onMapReady);
      if (map) {
        mapRef.current = map;
        parcelRendererRef.current = new ParcelRenderer(map, onParcelClick);
        
        // Wait for map to be ready
        google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
          console.log('✅ Map tiles loaded');
          setTimeout(() => {
            setInitialLoadComplete(true);
          }, 500);
        });
      }
    }
  }, [isLoaded, selectedProperty, onMapReady, onParcelClick]);

  useEffect(() => {
    if (mapRef.current && parcelRendererRef.current && cadastralParcels.length > 0 && initialLoadComplete) {
      console.log(`🎯 Rendering ${cadastralParcels.length} parcels`);
      displayCadastralParcels();
    }
  }, [cadastralParcels, statusFilter, initialLoadComplete]);

  const displayCadastralParcels = () => {
    if (!parcelRendererRef.current || !mapRef.current) {
      console.log('❌ No parcel renderer or map available');
      return;
    }

    // Clear existing polygons
    console.log('🧹 Clearing existing polygons');
    parcelRendererRef.current.clearAll();

    // Filter parcels
    const filteredParcels = statusFilter === 'ALL' 
      ? cadastralParcels 
      : cadastralParcels.filter(parcel => parcel.status === statusFilter);

    console.log(`🎯 Displaying ${filteredParcels.length} filtered parcels`);
    
    if (filteredParcels.length === 0) {
      console.log('⚠️ No parcels to display');
      setParcelsRendered(false);
      return;
    }

    let renderedCount = 0;
    const bounds = new google.maps.LatLngBounds();

    filteredParcels.forEach((parcel, index) => {
      if (parcelRendererRef.current?.renderParcel(parcel, bounds, index)) {
        renderedCount++;
      }
    });

    console.log(`🎉 Rendered ${renderedCount}/${filteredParcels.length} parcels`);
    
    if (renderedCount > 0) {
      // Fit bounds after rendering
      setTimeout(() => {
        parcelRendererRef.current?.fitMapToAllParcels();
        setParcelsRendered(true);
      }, 1000);
    } else {
      setParcelsRendered(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-0 relative">
        <div 
          id="cadastral-map" 
          className="w-full h-96 rounded-lg"
          style={{ minHeight: '600px' }}
        />
        {/* Status indicator */}
        {initialLoadComplete && (
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-sm">
            {parcelsRendered ? (
              <span className="text-green-600">
                ✅ {cadastralParcels.length} parcelas cargadas
              </span>
            ) : (
              <span className="text-orange-600">⏳ Cargando parcelas...</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CadastralMap;

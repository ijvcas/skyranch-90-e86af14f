
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Property, CadastralParcel } from '@/services/cadastralService';
import { ParcelStatus } from '@/utils/cadastral/types';
import { initializeRebuildMap } from './cadastral-map/RebuildMapInitializer';
import { ParcelRenderer } from './cadastral-map/ParcelRenderer';
import { SKYRANCH_COORDINATES } from '@/utils/cadastral/coordinateSystemRebuild';

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
      console.log('🗺️ Initializing rebuild map for SkyRanch');
      console.log(`🎯 Forcing map to SkyRanch coordinates: ${SKYRANCH_COORDINATES.lat}, ${SKYRANCH_COORDINATES.lng}`);
      
      const map = initializeRebuildMap(selectedProperty, 'cadastral-map', onMapReady);
      if (map) {
        mapRef.current = map;
        parcelRendererRef.current = new ParcelRenderer(map, onParcelClick);
        
        // Wait for map to be fully ready before rendering parcels
        google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
          console.log('✅ Rebuild map tiles loaded at SkyRanch, ready for parcels');
          setTimeout(() => {
            setInitialLoadComplete(true);
          }, 300);
        });
      }
    }
  }, [isLoaded, selectedProperty, onMapReady, onParcelClick]);

  useEffect(() => {
    if (mapRef.current && parcelRendererRef.current && cadastralParcels.length > 0 && initialLoadComplete) {
      console.log(`🎯 RENDERING ${cadastralParcels.length} PARCELS AT SKYRANCH COORDINATES`);
      displayCadastralParcels();
    } else {
      console.log('⏳ Waiting for optimal conditions:', {
        hasMap: !!mapRef.current,
        hasRenderer: !!parcelRendererRef.current,
        parcelCount: cadastralParcels.length,
        initialLoadComplete
      });
    }
  }, [cadastralParcels, statusFilter, initialLoadComplete]);

  const displayCadastralParcels = () => {
    if (!parcelRendererRef.current || !mapRef.current) {
      console.log('❌ No parcel renderer or map available');
      return;
    }

    // Clear existing polygons first
    console.log('🧹 Clearing existing polygons');
    parcelRendererRef.current.clearAll();

    // Filter parcels based on status
    const filteredParcels = statusFilter === 'ALL' 
      ? cadastralParcels 
      : cadastralParcels.filter(parcel => parcel.status === statusFilter);

    console.log(`🎯 Rendering ${filteredParcels.length} parcels at SkyRanch coordinates`);
    
    if (filteredParcels.length === 0) {
      console.log('⚠️ No parcels to display after filtering');
      setParcelsRendered(false);
      return;
    }

    let validParcels = 0;
    const bounds = new google.maps.LatLngBounds();

    filteredParcels.forEach((parcel, index) => {
      console.log(`🔄 Rendering parcel ${index + 1}/${filteredParcels.length}: ${parcel.parcelId} at SkyRanch`);
      
      if (parcelRendererRef.current?.renderParcel(parcel, bounds, index)) {
        validParcels++;
        console.log(`✅ Successfully rendered parcel ${index + 1}: ${parcel.parcelId}`);
      } else {
        console.warn(`❌ Failed to render parcel ${index + 1}: ${parcel.parcelId}`);
      }
    });

    console.log(`🎉 RENDERED ${validParcels}/${filteredParcels.length} parcels at SkyRanch coordinates`);
    
    if (validParcels === 0) {
      console.error('🚨 NO PARCELS WERE RENDERED!');
      setParcelsRendered(false);
    } else {
      // Fit map bounds to show all parcels optimally
      console.log('🎯 Fitting map bounds to show all parcels');
      setTimeout(() => {
        parcelRendererRef.current?.fitMapToAllParcels();
        setParcelsRendered(true);
      }, 500);
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
        {/* Status indicator */}
        {initialLoadComplete && (
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-sm">
            {parcelsRendered ? (
              <span className="text-green-600">
                ✅ {cadastralParcels.length} parcelas at SkyRanch ({SKYRANCH_COORDINATES.lat.toFixed(6)}, {SKYRANCH_COORDINATES.lng.toFixed(6)})
              </span>
            ) : (
              <span className="text-orange-600">⏳ Loading at SkyRanch coordinates...</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CadastralMap;

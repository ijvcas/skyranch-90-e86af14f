
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
      console.log('🗺️ Initializing map for property:', selectedProperty.name);
      const map = initializeMap(selectedProperty, 'cadastral-map', onMapReady);
      if (map) {
        mapRef.current = map;
        parcelRendererRef.current = new ParcelRenderer(map, onParcelClick);
        
        // CRITICAL FIX: Ensure map is fully ready before marking as complete
        google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
          console.log('✅ Map tiles loaded, ready for parcels');
          setTimeout(() => {
            setInitialLoadComplete(true);
          }, 200);
        });
      }
    }
  }, [isLoaded, selectedProperty, onMapReady, onParcelClick]);

  useEffect(() => {
    if (mapRef.current && parcelRendererRef.current && cadastralParcels.length > 0 && initialLoadComplete) {
      console.log(`🎯 ATTEMPTING TO DISPLAY ${cadastralParcels.length} CADASTRAL PARCELS ON MAP`);
      displayCadastralParcels();
    } else {
      console.log('⏳ Waiting for conditions:', {
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

    // CRITICAL FIX: Always clear existing polygons first to prevent duplicates
    console.log('🧹 Clearing existing polygons before rendering new ones');
    parcelRendererRef.current.clearAll();

    // Filter parcels based on status
    const filteredParcels = statusFilter === 'ALL' 
      ? cadastralParcels 
      : cadastralParcels.filter(parcel => parcel.status === statusFilter);

    console.log(`🎯 Processing ${filteredParcels.length} filtered cadastral parcels out of ${cadastralParcels.length} total`);
    
    if (filteredParcels.length === 0) {
      console.log('⚠️ No parcels to display after filtering');
      setParcelsRendered(false);
      return;
    }

    let validParcels = 0;
    const bounds = new google.maps.LatLngBounds();

    filteredParcels.forEach((parcel, index) => {
      console.log(`🔄 Processing parcel ${index + 1}/${filteredParcels.length}: ${parcel.parcelId}`);
      
      // CRITICAL FIX: Pass bounds to each parcel render to collect all coordinates
      if (parcelRendererRef.current?.renderParcel(parcel, bounds, index)) {
        validParcels++;
        console.log(`✅ Successfully rendered parcel ${index + 1}: ${parcel.parcelId}`);
      } else {
        console.warn(`❌ Failed to render parcel ${index + 1}: ${parcel.parcelId}`);
      }
    });

    console.log(`🎉 FINAL RESULT: Successfully displayed ${validParcels} out of ${filteredParcels.length} filtered parcels`);
    
    if (validParcels === 0) {
      console.error('🚨 NO PARCELS WERE RENDERED! Check coordinate validation and data format.');
      setParcelsRendered(false);
    } else {
      // CRITICAL FIX: Fit map bounds to show all parcels after rendering
      console.log('🎯 Fitting map bounds to show all rendered parcels');
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
        {/* CRITICAL FIX: Add status indicator */}
        {initialLoadComplete && (
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-sm">
            {parcelsRendered ? `✅ ${cadastralParcels.length} parcelas cargadas` : '⏳ Cargando parcelas...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CadastralMap;

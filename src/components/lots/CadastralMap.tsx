
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Property, CadastralParcel } from '@/services/cadastralService';
import { PARCEL_STATUS_COLORS, ParcelStatus } from '@/utils/cadastral/types';

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
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const labelsRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (isLoaded && selectedProperty && !mapRef.current) {
      initializeMap();
    }
  }, [isLoaded, selectedProperty]);

  useEffect(() => {
    if (mapRef.current && cadastralParcels.length > 0) {
      console.log(`Displaying ${cadastralParcels.length} cadastral parcels on map`);
      displayCadastralParcels();
    }
  }, [cadastralParcels, statusFilter]);

  const initializeMap = () => {
    if (!selectedProperty) return;

    const mapElement = document.getElementById('cadastral-map');
    if (!mapElement) return;

    console.log('Initializing cadastral map with center:', selectedProperty.centerLat, selectedProperty.centerLng);

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

    mapRef.current = newMap;
    onMapReady(newMap);
  };

  const clearExistingPolygons = () => {
    polygonsRef.current.forEach(polygon => {
      polygon.setMap(null);
    });
    polygonsRef.current = [];

    labelsRef.current.forEach(label => {
      label.setMap(null);
    });
    labelsRef.current = [];
  };

  const getParcelColor = (status?: ParcelStatus | string): string => {
    const parcelStatus = (status as ParcelStatus) || 'SHOPPING_LIST';
    return PARCEL_STATUS_COLORS[parcelStatus] || PARCEL_STATUS_COLORS.SHOPPING_LIST;
  };

  const calculatePolygonCenter = (coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } => {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  };

  const displayCadastralParcels = () => {
    if (!mapRef.current) {
      console.log('No map available for displaying parcels');
      return;
    }

    clearExistingPolygons();

    // Filter parcels based on status
    const filteredParcels = statusFilter === 'ALL' 
      ? cadastralParcels 
      : cadastralParcels.filter(parcel => parcel.status === statusFilter);

    console.log(`Processing ${filteredParcels.length} filtered cadastral parcels`);
    
    let validParcels = 0;
    const bounds = new google.maps.LatLngBounds();

    filteredParcels.forEach((parcel, index) => {
      if (parcel.boundaryCoordinates && parcel.boundaryCoordinates.length >= 3) {
        console.log(`Creating polygon for parcel ${index + 1}: ${parcel.parcelId}`);
        
        const validCoords = parcel.boundaryCoordinates.filter(coord => 
          coord && 
          typeof coord.lat === 'number' && 
          typeof coord.lng === 'number' &&
          !isNaN(coord.lat) && 
          !isNaN(coord.lng) &&
          Math.abs(coord.lat) <= 90 && 
          Math.abs(coord.lng) <= 180
        );

        if (validCoords.length >= 3) {
          const color = getParcelColor(parcel.status);
          
          const polygon = new google.maps.Polygon({
            paths: validCoords,
            fillColor: color,
            fillOpacity: 0.3,
            strokeColor: color,
            strokeWeight: 2,
            clickable: true,
            editable: false,
          });

          polygon.setMap(mapRef.current);
          polygonsRef.current.push(polygon);

          // Add click listener
          polygon.addListener('click', () => {
            onParcelClick(parcel);
          });

          // Create lot number label at polygon center
          if (parcel.lotNumber) {
            const center = calculatePolygonCenter(validCoords);
            
            const label = new google.maps.Marker({
              position: center,
              map: mapRef.current,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 0, // Make the marker invisible
              },
              label: {
                text: parcel.lotNumber,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                className: 'lot-number-label'
              },
              clickable: false,
            });

            labelsRef.current.push(label);
          }

          // Extend bounds
          validCoords.forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${parcel.displayName || parcel.parcelId}</h3>
                ${parcel.lotNumber ? `<p>Número: ${parcel.lotNumber}</p>` : ''}
                ${parcel.areaHectares ? `<p>Área: ${parcel.areaHectares.toFixed(2)} ha</p>` : ''}
                ${parcel.classification ? `<p>Clasificación: ${parcel.classification}</p>` : ''}
                ${parcel.status ? `<p>Estado: ${parcel.status}</p>` : ''}
                ${parcel.notes ? `<p>Notas: ${parcel.notes}</p>` : ''}
              </div>
            `
          });

          polygon.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
            infoWindow.setPosition(event.latLng);
            infoWindow.open(mapRef.current);
          });

          validParcels++;
        } else {
          console.warn(`Parcel ${parcel.parcelId} has invalid coordinates:`, parcel.boundaryCoordinates);
        }
      } else {
        console.warn(`Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      }
    });

    console.log(`Successfully displayed ${validParcels} out of ${filteredParcels.length} filtered parcels`);

    // Fit map to show all parcels if we have valid bounds
    if (!bounds.isEmpty() && validParcels > 0) {
      console.log('Fitting map to bounds of all parcels');
      mapRef.current?.fitBounds(bounds);
      
      google.maps.event.addListenerOnce(mapRef.current!, 'bounds_changed', () => {
        const zoom = mapRef.current?.getZoom();
        if (zoom && zoom > 18) {
          mapRef.current?.setZoom(18);
        }
      });
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

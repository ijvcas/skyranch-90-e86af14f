
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Property, CadastralParcel } from '@/services/cadastralService';

interface CadastralMapProps {
  isLoaded: boolean;
  selectedProperty: Property | undefined;
  cadastralParcels: CadastralParcel[];
  onMapReady: (map: google.maps.Map) => void;
}

const CadastralMap: React.FC<CadastralMapProps> = ({
  isLoaded,
  selectedProperty,
  cadastralParcels,
  onMapReady
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

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
  }, [cadastralParcels]);

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
  };

  const displayCadastralParcels = () => {
    if (!mapRef.current) {
      console.log('No map available for displaying parcels');
      return;
    }

    // Clear existing polygons
    clearExistingPolygons();

    console.log(`Processing ${cadastralParcels.length} cadastral parcels`);
    
    let validParcels = 0;
    const bounds = new google.maps.LatLngBounds();

    cadastralParcels.forEach((parcel, index) => {
      if (parcel.boundaryCoordinates && parcel.boundaryCoordinates.length >= 3) {
        console.log(`Creating polygon for parcel ${index + 1}: ${parcel.parcelId}`);
        console.log(`Coordinates sample:`, parcel.boundaryCoordinates.slice(0, 3));
        
        // Validate coordinates
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
          const polygon = new google.maps.Polygon({
            paths: validCoords,
            fillColor: '#FFD700',
            fillOpacity: 0.3,
            strokeColor: '#FFA500',
            strokeWeight: 2,
            clickable: true,
            editable: false,
          });

          polygon.setMap(mapRef.current);
          polygonsRef.current.push(polygon);

          // Extend bounds to include this parcel
          validCoords.forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
          });

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

    console.log(`Successfully displayed ${validParcels} out of ${cadastralParcels.length} parcels`);

    // Fit map to show all parcels if we have valid bounds
    if (!bounds.isEmpty() && validParcels > 0) {
      console.log('Fitting map to bounds of all parcels');
      mapRef.current?.fitBounds(bounds);
      
      // Set a reasonable zoom level if too zoomed in
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

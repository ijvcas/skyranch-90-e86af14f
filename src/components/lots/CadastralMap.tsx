
import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (isLoaded && selectedProperty && !mapRef.current) {
      initializeMap();
    }
  }, [isLoaded, selectedProperty]);

  useEffect(() => {
    if (mapRef.current && cadastralParcels.length > 0) {
      displayCadastralParcels();
    }
  }, [cadastralParcels]);

  const initializeMap = () => {
    if (!selectedProperty) return;

    const mapElement = document.getElementById('cadastral-map');
    if (!mapElement) return;

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

  const displayCadastralParcels = () => {
    if (!mapRef.current) return;

    cadastralParcels.forEach(parcel => {
      if (parcel.boundaryCoordinates && parcel.boundaryCoordinates.length > 0) {
        const polygon = new google.maps.Polygon({
          paths: parcel.boundaryCoordinates,
          fillColor: '#FFD700',
          fillOpacity: 0.3,
          strokeColor: '#FFA500',
          strokeWeight: 2,
          clickable: true,
          editable: false,
        });

        polygon.setMap(mapRef.current);

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
      }
    });
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

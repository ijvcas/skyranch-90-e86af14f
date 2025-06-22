
import type { CadastralParcel } from '@/services/cadastralService';
import { PARCEL_STATUS_COLORS, type ParcelStatus } from '@/utils/cadastral/types';

export class ParcelRenderer {
  private polygons: google.maps.Polygon[] = [];
  private labels: google.maps.Marker[] = [];

  constructor(private map: google.maps.Map, private onParcelClick: (parcel: CadastralParcel) => void) {}

  clearAll() {
    console.log(`🧹 Clearing ${this.polygons.length} polygons and ${this.labels.length} labels`);
    this.polygons.forEach(polygon => polygon.setMap(null));
    this.polygons = [];
    this.labels.forEach(label => label.setMap(null));
    this.labels = [];
  }

  private getParcelColor(status?: ParcelStatus | string): string {
    const parcelStatus = (status as ParcelStatus) || 'SHOPPING_LIST';
    return PARCEL_STATUS_COLORS[parcelStatus] || PARCEL_STATUS_COLORS.SHOPPING_LIST;
  }

  private calculatePolygonCenter(coordinates: { lat: number; lng: number }[]): { lat: number; lng: number } {
    const latSum = coordinates.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coordinates.reduce((sum, coord) => sum + coord.lng, 0);
    return {
      lat: latSum / coordinates.length,
      lng: lngSum / coordinates.length
    };
  }

  renderParcel(parcel: CadastralParcel, bounds: google.maps.LatLngBounds, index: number = 0): boolean {
    if (!parcel.boundaryCoordinates || parcel.boundaryCoordinates.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      return false;
    }

    // CONSERVATIVE: Use coordinates exactly as stored - minimal filtering
    const coordinates = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng)
    );

    if (coordinates.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has insufficient coordinates: ${coordinates.length}/3 required`);
      return false;
    }

    console.log(`🗺️ Rendering parcel ${index + 1}: ${parcel.parcelId} with ${coordinates.length} coordinates`);
    console.log(`📍 First coordinate: ${coordinates[0].lat.toFixed(8)}, ${coordinates[0].lng.toFixed(8)}`);

    const color = this.getParcelColor(parcel.status);
    
    // Create polygon with preserved coordinates
    const polygon = new google.maps.Polygon({
      paths: coordinates,
      fillColor: color,
      fillOpacity: 0.6,
      strokeColor: '#000000',
      strokeWeight: 1,
      clickable: true,
      editable: false,
      zIndex: 1,
    });

    polygon.setMap(this.map);
    this.polygons.push(polygon);

    // Extend bounds for each coordinate
    coordinates.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });

    // Add click listener
    polygon.addListener('click', () => {
      console.log(`🖱️ Clicked parcel polygon: ${parcel.parcelId}`);
      this.onParcelClick(parcel);
    });

    // Sequential lot numbers: 1, 2, 3, 4, 5...
    const displayLotNumber = (index + 1).toString();
    const center = this.calculatePolygonCenter(coordinates);
    
    // Create white text label
    const label = new google.maps.Marker({
      position: center,
      map: this.map,
      icon: {
        path: 'M 0,0 0,0',
        scale: 1,
        fillOpacity: 0,
        strokeOpacity: 0
      },
      label: {
        text: displayLotNumber,
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: 'bold',
        fontFamily: 'Arial, sans-serif'
      },
      clickable: true,
      title: `Parcela ${displayLotNumber} - ${parcel.displayName || parcel.parcelId}`,
      zIndex: 10000,
      optimized: false
    });

    // Add click listener to label
    label.addListener('click', () => {
      console.log(`🏷️ Clicked label for parcel: ${parcel.parcelId}, lot: ${displayLotNumber}`);
      this.onParcelClick(parcel);
    });

    this.labels.push(label);

    // Enhanced info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${parcel.displayName || parcel.parcelId}</h3>
          <p class="mb-1"><strong>Número de Parcela:</strong> ${displayLotNumber}</p>
          <p class="mb-1"><strong>ID Catastral:</strong> ${parcel.parcelId}</p>
          ${parcel.areaHectares ? `<p class="mb-1"><strong>Área:</strong> ${parcel.areaHectares.toFixed(4)} ha</p>` : ''}
          ${parcel.classification ? `<p class="mb-1"><strong>Clasificación:</strong> ${parcel.classification}</p>` : ''}
          ${parcel.status ? `<p class="mb-1"><strong>Estado:</strong> ${parcel.status}</p>` : ''}
          ${parcel.notes ? `<p class="mb-1"><strong>Notas:</strong> ${parcel.notes}</p>` : ''}
          <p class="text-xs text-gray-500 mt-2">Click derecho para más información</p>
        </div>
      `
    });

    polygon.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        infoWindow.setPosition(event.latLng);
        infoWindow.open(this.map);
      }
    });

    console.log(`✅ Parcel ${parcel.parcelId} rendered successfully with label ${displayLotNumber}`);
    return true;
  }

  // Fit map bounds to show all rendered parcels
  fitMapToAllParcels() {
    if (this.polygons.length === 0) {
      console.log('⚠️ No polygons to fit bounds to');
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    this.polygons.forEach(polygon => {
      const path = polygon.getPath();
      path.forEach(latLng => {
        bounds.extend(latLng);
      });
    });

    console.log(`🎯 Fitting map bounds to ${this.polygons.length} parcels`);
    this.map.fitBounds(bounds);
    
    // Set appropriate zoom to see all parcels clearly
    google.maps.event.addListenerOnce(this.map, 'bounds_changed', () => {
      const zoom = this.map.getZoom();
      if (zoom && zoom > 18) {
        this.map.setZoom(18);
      } else if (zoom && zoom < 16) {
        this.map.setZoom(16);
      }
    });
  }
}

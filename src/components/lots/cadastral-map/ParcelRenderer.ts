
import type { CadastralParcel } from '@/services/cadastralService';
import { PARCEL_STATUS_COLORS, type ParcelStatus } from '@/utils/cadastral/types';

export class ParcelRenderer {
  private polygons: google.maps.Polygon[] = [];
  private labels: google.maps.Marker[] = [];

  constructor(private map: google.maps.Map, private onParcelClick: (parcel: CadastralParcel) => void) {}

  clearAll() {
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

  renderParcel(parcel: CadastralParcel, bounds: google.maps.LatLngBounds): boolean {
    if (!parcel.boundaryCoordinates || parcel.boundaryCoordinates.length < 3) {
      console.warn(`Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      return false;
    }

    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      Math.abs(coord.lat) <= 90 && 
      Math.abs(coord.lng) <= 180
    );

    if (validCoords.length < 3) {
      console.warn(`Parcel ${parcel.parcelId} has invalid coordinates:`, parcel.boundaryCoordinates);
      return false;
    }

    const color = this.getParcelColor(parcel.status);
    
    const polygon = new google.maps.Polygon({
      paths: validCoords,
      fillColor: color,
      fillOpacity: 0.3,
      strokeColor: color,
      strokeWeight: 2,
      clickable: true,
      editable: false,
    });

    polygon.setMap(this.map);
    this.polygons.push(polygon);

    // Add click listener
    polygon.addListener('click', () => {
      this.onParcelClick(parcel);
    });

    // Create lot number label at polygon center
    if (parcel.lotNumber) {
      const center = this.calculatePolygonCenter(validCoords);
      
      const label = new google.maps.Marker({
        position: center,
        map: this.map,
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

      this.labels.push(label);
    }

    // Extend bounds
    validCoords.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });

    // Add info window
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
      infoWindow.open(this.map);
    });

    return true;
  }
}

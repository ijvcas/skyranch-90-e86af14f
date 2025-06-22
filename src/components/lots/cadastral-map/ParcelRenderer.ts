
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

    // Log coordinate sample for debugging
    console.log(`🗺️ Rendering parcel ${parcel.parcelId} with ${validCoords.length} coordinates. Sample:`, validCoords.slice(0, 3));
    console.log(`📍 Lot number: ${parcel.lotNumber || 'N/A'}`);

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
      console.log(`🖱️ Clicked parcel: ${parcel.parcelId}, lot: ${parcel.lotNumber}`);
      this.onParcelClick(parcel);
    });

    // Create lot number label at polygon center - make it more visible
    if (parcel.lotNumber) {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating label for lot ${parcel.lotNumber} at:`, center);
      
      const label = new google.maps.Marker({
        position: center,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ffffff',
          fillOpacity: 0.8,
          strokeColor: '#333333',
          strokeWeight: 1
        },
        label: {
          text: parcel.lotNumber,
          color: '#000000',
          fontSize: '14px',
          fontWeight: 'bold'
        },
        clickable: true,
        title: `Parcela ${parcel.lotNumber} - ${parcel.displayName || parcel.parcelId}`
      });

      // Add click listener to label as well
      label.addListener('click', () => {
        console.log(`🏷️ Clicked label for parcel: ${parcel.parcelId}, lot: ${parcel.lotNumber}`);
        this.onParcelClick(parcel);
      });

      this.labels.push(label);
    } else {
      console.warn(`❌ No lot number available for parcel: ${parcel.parcelId}`);
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
          ${parcel.lotNumber ? `<p><strong>Número:</strong> ${parcel.lotNumber}</p>` : ''}
          ${parcel.areaHectares ? `<p><strong>Área:</strong> ${parcel.areaHectares.toFixed(2)} ha</p>` : ''}
          ${parcel.classification ? `<p><strong>Clasificación:</strong> ${parcel.classification}</p>` : ''}
          ${parcel.status ? `<p><strong>Estado:</strong> ${parcel.status}</p>` : ''}
          ${parcel.notes ? `<p><strong>Notas:</strong> ${parcel.notes}</p>` : ''}
        </div>
      `
    });

    polygon.addListener('rightclick', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        infoWindow.setPosition(event.latLng);
        infoWindow.open(this.map);
      }
    });

    return true;
  }
}

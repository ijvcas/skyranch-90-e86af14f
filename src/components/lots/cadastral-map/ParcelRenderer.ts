
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

  renderParcel(parcel: CadastralParcel, bounds: google.maps.LatLngBounds): boolean {
    if (!parcel.boundaryCoordinates || parcel.boundaryCoordinates.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      return false;
    }

    // RELAXED coordinate validation - allow more coordinates to show on map
    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      Math.abs(coord.lat) <= 90 && 
      Math.abs(coord.lng) <= 180 &&
      coord.lat !== 0 && coord.lng !== 0 &&
      // RELAXED: More generous area around SkyRanch to show more parcels
      coord.lat >= 40.30 && coord.lat <= 40.33 && 
      coord.lng >= -4.50 && coord.lng <= -4.45    
    );

    if (validCoords.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has insufficient valid coordinates: ${validCoords.length}/3 required`);
      return false;
    }

    console.log(`\n🗺️ === RENDERING PARCEL ===`);
    console.log(`📋 Parcel ID: ${parcel.parcelId}`);
    console.log(`🔢 Lot Number: ${parcel.lotNumber || 'N/A'}`);
    console.log(`📊 Valid coordinates: ${validCoords.length}/${parcel.boundaryCoordinates.length}`);

    const color = this.getParcelColor(parcel.status);
    
    const polygon = new google.maps.Polygon({
      paths: validCoords,
      fillColor: color,
      fillOpacity: 0.4,
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

    // FIXED: Use database lot_number directly for labels
    if (parcel.lotNumber) {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating WHITE TEXT label for lot ${parcel.lotNumber} at:`, center);
      
      const label = new google.maps.Marker({
        position: center,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 0,
          fillOpacity: 0,
          strokeOpacity: 0,
          fillColor: 'transparent',
          strokeColor: 'transparent'
        },
        label: {
          text: parcel.lotNumber.toString(),
          color: '#FFFFFF',
          fontSize: '16px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        },
        clickable: true,
        title: `Parcela ${parcel.lotNumber} - ${parcel.displayName || parcel.parcelId}`,
        zIndex: 10000,
        optimized: false
      });

      // Add click listener to label as well
      label.addListener('click', () => {
        console.log(`🏷️ Clicked label for parcel: ${parcel.parcelId}, lot: ${parcel.lotNumber}`);
        this.onParcelClick(parcel);
      });

      this.labels.push(label);
      console.log(`✅ WHITE TEXT label created for lot ${parcel.lotNumber}`);
    } else {
      console.warn(`⚠️ No lot number available for parcel: ${parcel.parcelId}`);
    }

    // Enhanced info window with more details
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${parcel.displayName || parcel.parcelId}</h3>
          ${parcel.lotNumber ? `<p class="mb-1"><strong>Número de Parcela:</strong> ${parcel.lotNumber}</p>` : ''}
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

    console.log(`✅ Parcel ${parcel.parcelId} rendered successfully`);
    console.log(`=== END PARCEL RENDERING ===\n`);

    return true;
  }
}


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

  // FIXED: Simple sequential lot number generation
  private generateSimpleLotNumber(parcelId: string, index: number): string {
    console.log(`🔢 Generating simple lot number for: ${parcelId} at index ${index}`);
    
    // Handle the special format: 5141313UK7654S
    if (parcelId.includes('5141313UK7654S')) {
      console.log(`✅ Special format handled: SPECIAL`);
      return 'SPECIAL';
    }
    
    // Generate simple sequential numbers: 1, 2, 3, 4, etc.
    const lotNumber = (index + 1).toString();
    console.log(`✅ Generated simple lot number: ${lotNumber}`);
    return lotNumber;
  }

  renderParcel(parcel: CadastralParcel, bounds: google.maps.LatLngBounds, index: number = 0): boolean {
    if (!parcel.boundaryCoordinates || parcel.boundaryCoordinates.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      return false;
    }

    // FIXED: Much more lenient coordinate validation for SkyRanch area
    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      coord.lat !== 0 && coord.lng !== 0 &&
      // FIXED: Very lenient bounds - if coordinates are anywhere near Spain, allow them
      coord.lat >= 35.0 && coord.lat <= 45.0 && 
      coord.lng >= -10.0 && coord.lng <= 5.0    
    );

    if (validCoords.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has insufficient valid coordinates: ${validCoords.length}/3 required`);
      console.log('Sample coordinates:', parcel.boundaryCoordinates.slice(0, 3));
      return false;
    }

    console.log(`\n🗺️ === RENDERING PARCEL ===`);
    console.log(`📋 Parcel ID: ${parcel.parcelId}`);
    console.log(`📊 Valid coordinates: ${validCoords.length}/${parcel.boundaryCoordinates.length}`);
    console.log(`🎯 First coordinate: ${validCoords[0].lat}, ${validCoords[0].lng}`);

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
      console.log(`🖱️ Clicked parcel: ${parcel.parcelId}`);
      this.onParcelClick(parcel);
    });

    // FIXED: Use simple lot numbers or database lot_number
    const displayLotNumber = parcel.lotNumber || this.generateSimpleLotNumber(parcel.parcelId, index);
    
    if (displayLotNumber && displayLotNumber !== 'N/A') {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating label for lot ${displayLotNumber} at:`, center);
      
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
          text: displayLotNumber.toString(),
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

      // Add click listener to label as well
      label.addListener('click', () => {
        console.log(`🏷️ Clicked label for parcel: ${parcel.parcelId}, lot: ${displayLotNumber}`);
        this.onParcelClick(parcel);
      });

      this.labels.push(label);
      console.log(`✅ Label created for lot ${displayLotNumber}`);
    }

    // Enhanced info window with more details
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-bold text-lg mb-2">${parcel.displayName || parcel.parcelId}</h3>
          ${displayLotNumber ? `<p class="mb-1"><strong>Número de Parcela:</strong> ${displayLotNumber}</p>` : ''}
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

    console.log(`✅ Parcel ${parcel.parcelId} rendered successfully with lot number ${displayLotNumber}`);
    console.log(`=== END PARCEL RENDERING ===\n`);

    return true;
  }
}

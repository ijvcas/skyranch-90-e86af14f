
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

    // CRITICAL FIX: Use exact coordinate ranges that match the actual data
    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      coord.lat !== 0 && coord.lng !== 0 &&
      // FIXED: Use exact SkyRanch coordinate bounds - very precise ranges
      coord.lat >= 40.099 && coord.lat <= 40.103 && 
      coord.lng >= -4.475 && coord.lng <= -4.466    
    );

    if (validCoords.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has insufficient valid coordinates: ${validCoords.length}/3 required`);
      console.log('Coordinate range check - Sample coordinates:', parcel.boundaryCoordinates.slice(0, 3));
      return false;
    }

    console.log(`\n🗺️ === RENDERING PARCEL ${index + 1} ===`);
    console.log(`📋 Parcel ID: ${parcel.parcelId}`);
    console.log(`📊 Valid coordinates: ${validCoords.length}/${parcel.boundaryCoordinates.length}`);
    console.log(`🎯 First coordinate: ${validCoords[0].lat.toFixed(6)}, ${validCoords[0].lng.toFixed(6)}`);

    const color = this.getParcelColor(parcel.status);
    
    const polygon = new google.maps.Polygon({
      paths: validCoords,
      fillColor: color,
      fillOpacity: 0.6, // CRITICAL FIX: Increased opacity for better visibility
      strokeColor: color === '#f3f4f6' ? '#9ca3af' : color,
      strokeWeight: 3, // CRITICAL FIX: Increased stroke weight for visibility
      clickable: true,
      editable: false,
      zIndex: 1, // Ensure polygons are visible
    });

    polygon.setMap(this.map);
    this.polygons.push(polygon);

    // CRITICAL FIX: Extend bounds for each parcel to ensure map fits all parcels
    validCoords.forEach(coord => {
      bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
    });

    // Add click listener
    polygon.addListener('click', () => {
      console.log(`🖱️ Clicked parcel polygon: ${parcel.parcelId}`);
      this.onParcelClick(parcel);
    });

    // Use simple lot numbers or database lot_number
    const displayLotNumber = parcel.lotNumber || this.generateSimpleLotNumber(parcel.parcelId, index);
    
    if (displayLotNumber && displayLotNumber !== 'N/A') {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating label for lot ${displayLotNumber} at: ${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`);
      
      const label = new google.maps.Marker({
        position: center,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12, // CRITICAL FIX: Larger background for better visibility
          fillOpacity: 0.8,
          strokeOpacity: 0.9,
          fillColor: '#FFFFFF',
          strokeColor: '#000000',
          strokeWeight: 2
        },
        label: {
          text: displayLotNumber.toString(),
          color: '#000000', // CRITICAL FIX: Black text for better contrast
          fontSize: '14px',
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

  // CRITICAL FIX: Add method to fit map bounds to all rendered parcels
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
    
    // Set a reasonable zoom level to see parcel details
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

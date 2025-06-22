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

    // ENHANCED coordinate validation - ensure we're in the SkyRanch area ONLY
    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      Math.abs(coord.lat) <= 90 && 
      Math.abs(coord.lng) <= 180 &&
      coord.lat !== 0 && coord.lng !== 0 && // Exclude zero coordinates
      // STRICT: Only accept coordinates in the immediate SkyRanch area
      coord.lat >= 40.31 && coord.lat <= 40.32 && // Very narrow latitude range around SkyRanch
      coord.lng >= -4.48 && coord.lng <= -4.47    // Very narrow longitude range around SkyRanch
    );

    if (validCoords.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} coordinates outside SkyRanch area: ${validCoords.length}/3 required`);
      console.warn('Rejected coordinates (outside SkyRanch bounds):', parcel.boundaryCoordinates.filter(coord => 
        coord.lat < 40.31 || coord.lat > 40.32 || coord.lng < -4.48 || coord.lng > -4.47
      ));
      return false;
    }

    console.log(`\n🗺️ === RENDERING PARCEL ===`);
    console.log(`📋 Parcel ID: ${parcel.parcelId}`);
    console.log(`🔢 Lot Number: ${parcel.lotNumber || 'N/A'}`);
    console.log(`📊 Valid coordinates in SkyRanch area: ${validCoords.length}/${parcel.boundaryCoordinates.length}`);
    console.log(`📍 Sample coordinates:`, validCoords.slice(0, 3));

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

    // ENHANCED lot number label rendering - FORCE visibility
    if (parcel.lotNumber) {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating MAXIMUM VISIBILITY label for lot ${parcel.lotNumber} at:`, center);
      
      // Create the most visible marker possible
      const label = new google.maps.Marker({
        position: center,
        map: this.map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 20, // Even larger scale
          fillColor: '#ffffff',
          fillOpacity: 1.0, // Full opacity white background
          strokeColor: '#000000', // Black border for maximum contrast
          strokeWeight: 4 // Very thick border
        },
        label: {
          text: parcel.lotNumber,
          color: '#000000', // Black text
          fontSize: '16px', // Larger font
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif'
        },
        clickable: true,
        title: `Parcela ${parcel.lotNumber} - ${parcel.displayName || parcel.parcelId}`,
        zIndex: 9999, // Maximum z-index to ensure visibility above everything
        optimized: false // Disable optimization to ensure rendering
      });

      // Add click listener to label as well
      label.addListener('click', () => {
        console.log(`🏷️ Clicked label for parcel: ${parcel.parcelId}, lot: ${parcel.lotNumber}`);
        this.onParcelClick(parcel);
      });

      this.labels.push(label);
      console.log(`✅ MAXIMUM VISIBILITY label created for lot ${parcel.lotNumber} with zIndex: 9999`);
    } else {
      console.warn(`⚠️ No lot number available for parcel: ${parcel.parcelId}`);
    }

    // Extend bounds with validation - only for valid SkyRanch coordinates
    try {
      validCoords.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });
    } catch (error) {
      console.error(`❌ Error extending bounds for parcel ${parcel.parcelId}:`, error);
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

    console.log(`✅ Parcel ${parcel.parcelId} rendered successfully in SkyRanch area`);
    console.log(`=== END PARCEL RENDERING ===\n`);

    return true;
  }
}

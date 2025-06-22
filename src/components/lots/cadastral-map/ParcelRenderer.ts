
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

  // FIXED: Enhanced unique lot number generation
  private generateUniqueLotNumber(parcelId: string): string {
    console.log(`🔍 Generating unique lot number for: ${parcelId}`);
    
    // Handle the special format: 5141313UK7654S
    if (parcelId.includes('5141313UK7654S')) {
      console.log(`✅ Special format handled: SPECIAL-1`);
      return 'SPECIAL-1';
    }
    
    // Extract cadastral area and lot number from Spanish cadastral format
    const patterns = [
      // Surface format: Surface_ES.SDGC.CP.28128A00800122.1
      /Surface_ES\.SDGC\.CP\.28128A(\d{2})(\d{6})(?:\.(\d+))?/,
      // Direct Spanish cadastral: 28128A00800122.1
      /28128A(\d{2})(\d{6})(?:\.(\d+))?/,
    ];
    
    for (const pattern of patterns) {
      const match = parcelId.match(pattern);
      if (match) {
        const area = match[1]; // e.g., "08", "81", "71", "00"
        const lotSequence = match[2]; // e.g., "00122", "00007", "00006"
        
        // Extract meaningful lot number from the 6-digit sequence
        let lotNumber = lotSequence.replace(/^0+/, ''); // Remove leading zeros
        
        // If we get an empty string (all zeros), use "0"
        if (lotNumber.length === 0) {
          lotNumber = "0";
        }
        
        // Create truly unique identifier: area-lot (e.g., "800-122", "810-7")
        const uniqueLot = `${area}0-${lotNumber}`;
        console.log(`✅ Generated unique lot: ${uniqueLot} from area ${area}, sequence ${lotSequence}`);
        return uniqueLot;
      }
    }
    
    // Fallback: try to extract any number sequence
    const numberMatch = parcelId.match(/(\d{2,})/);
    if (numberMatch) {
      const number = numberMatch[1];
      // Take first 2 digits as area, rest as lot
      if (number.length >= 4) {
        const area = number.substring(0, 2);
        const lot = number.substring(2).replace(/^0+/, '') || "0";
        const uniqueLot = `${area}0-${lot}`;
        console.log(`✅ Generated fallback unique lot: ${uniqueLot}`);
        return uniqueLot;
      }
    }
    
    console.log(`❌ Could not generate unique lot number, using fallback`);
    return 'N/A';
  }

  renderParcel(parcel: CadastralParcel, bounds: google.maps.LatLngBounds): boolean {
    if (!parcel.boundaryCoordinates || parcel.boundaryCoordinates.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has no valid boundary coordinates`);
      return false;
    }

    // FIXED: Updated coordinate validation to be less restrictive and match actual data
    const validCoords = parcel.boundaryCoordinates.filter(coord => 
      coord && 
      typeof coord.lat === 'number' && 
      typeof coord.lng === 'number' &&
      !isNaN(coord.lat) && 
      !isNaN(coord.lng) &&
      Math.abs(coord.lat) <= 90 && 
      Math.abs(coord.lng) <= 180 &&
      coord.lat !== 0 && coord.lng !== 0 &&
      // FIXED: More lenient range - if coordinates are in Spain, allow them
      coord.lat >= 39.0 && coord.lat <= 41.0 && 
      coord.lng >= -5.0 && coord.lng <= -3.0    
    );

    if (validCoords.length < 3) {
      console.warn(`❌ Parcel ${parcel.parcelId} has insufficient valid coordinates: ${validCoords.length}/3 required`);
      console.log('Invalid coordinates:', parcel.boundaryCoordinates);
      return false;
    }

    console.log(`\n🗺️ === RENDERING PARCEL ===`);
    console.log(`📋 Parcel ID: ${parcel.parcelId}`);
    console.log(`🔢 Original Lot: ${parcel.lotNumber || 'N/A'}`);
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

    // FIXED: Use database lot_number or generate unique lot number for labels
    const displayLotNumber = parcel.lotNumber || this.generateUniqueLotNumber(parcel.parcelId);
    
    if (displayLotNumber && displayLotNumber !== 'N/A') {
      const center = this.calculatePolygonCenter(validCoords);
      console.log(`🏷️ Creating WHITE TEXT label for lot ${displayLotNumber} at:`, center);
      
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
      console.log(`✅ WHITE TEXT label created for lot ${displayLotNumber}`);
    } else {
      console.warn(`⚠️ No lot number available for parcel: ${parcel.parcelId}`);
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

    console.log(`✅ Parcel ${parcel.parcelId} rendered successfully`);
    console.log(`=== END PARCEL RENDERING ===\n`);

    return true;
  }
}

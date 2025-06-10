
import { SKYRANCH_CENTER } from '../mapConstants';

export const useMapRenderer = () => {
  const addSkyRanchLabel = (map: google.maps.Map) => {
    if (!map) return;

    console.log('🏷️ Adding SKYRANCH label...');

    const marker = new google.maps.Marker({
      position: SKYRANCH_CENTER,
      map: map,
      label: {
        text: 'SKYRANCH',
        color: '#ffffff',
        fontSize: '24px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 0,
        strokeWeight: 0,
        fillOpacity: 0
      }
    });

    console.log('✅ SKYRANCH label added successfully');
  };

  return {
    addSkyRanchLabel
  };
};

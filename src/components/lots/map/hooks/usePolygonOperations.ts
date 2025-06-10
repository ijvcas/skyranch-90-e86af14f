
import { useToast } from '@/hooks/use-toast';

interface UsePolygonOperationsProps {
  map: React.MutableRefObject<google.maps.Map | null>;
  startDrawingPolygon: (lotId: string) => void;
  saveCurrentPolygon: (lotId: string, map: google.maps.Map) => void;
  deletePolygonForLot: (lotId: string, map: google.maps.Map) => void;
  setPolygonColor: (lotId: string, color: string, map: google.maps.Map) => void;
}

export const usePolygonOperations = ({
  map,
  startDrawingPolygon,
  saveCurrentPolygon,
  deletePolygonForLot,
  setPolygonColor
}: UsePolygonOperationsProps) => {
  const { toast } = useToast();

  const handleStartDrawingPolygon = (lotId: string) => {
    if (map.current) {
      startDrawingPolygon(lotId);
    } else {
      console.error('❌ Map not initialized for polygon drawing');
      toast({
        title: "Error",
        description: "El mapa no está inicializado",
        variant: "destructive"
      });
    }
  };

  const handleSaveCurrentPolygon = (lotId: string) => {
    if (map.current) {
      saveCurrentPolygon(lotId, map.current);
    } else {
      console.error('❌ Map not initialized for polygon saving');
      toast({
        title: "Error",
        description: "El mapa no está inicializado",
        variant: "destructive"
      });
    }
  };

  const handleDeletePolygonForLot = (lotId: string) => {
    if (map.current) {
      deletePolygonForLot(lotId, map.current);
    } else {
      console.error('❌ Map not initialized for polygon deletion');
      toast({
        title: "Error",
        description: "El mapa no está inicializado",
        variant: "destructive"
      });
    }
  };

  const handleSetPolygonColor = (lotId: string, color: string) => {
    if (map.current) {
      setPolygonColor(lotId, color, map.current);
    } else {
      console.error('❌ Map not initialized for polygon color change');
      toast({
        title: "Error",
        description: "El mapa no está inicializado",
        variant: "destructive"
      });
    }
  };

  return {
    handleStartDrawingPolygon,
    handleSaveCurrentPolygon,
    handleDeletePolygonForLot,
    handleSetPolygonColor
  };
};

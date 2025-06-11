
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Move } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { useDraggable } from '@/hooks/useDraggable';
import LotSelector from './controls/LotSelector';
import SelectedLotInfo from './controls/SelectedLotInfo';
import DrawingControls from './controls/DrawingControls';
import PolygonList from './controls/PolygonList';

interface MapDrawingControlsProps {
  lots: Lot[];
  selectedLotId: string;
  isDrawing: boolean;
  lotPolygons: Array<{ lotId: string; polygon: google.maps.Polygon; color: string }>;
  onStartDrawing: (lotId: string) => void;
  onDeletePolygon: (lotId: string) => void;
  onCancelDrawing: () => void;
  onLotSelect: (lotId: string) => void;
}

const MapDrawingControls = ({
  lots,
  selectedLotId,
  isDrawing,
  lotPolygons,
  onStartDrawing,
  onDeletePolygon,
  onCancelDrawing,
  onLotSelect
}: MapDrawingControlsProps) => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({
    x: 16,
    y: 16
  });

  const selectedLot = lots.find(l => l.id === selectedLotId);
  const hasPolygon = lotPolygons.some(lp => lp.lotId === selectedLotId);

  return (
    <>
      <Card 
        ref={dragRef}
        className={`absolute w-80 z-20 shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          left: `${position.x}px`,
          bottom: `${window.innerHeight - position.y - 400}px`,
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Square className="w-5 h-5 mr-2" />
              Control de Polígonos
            </div>
            <div 
              className="cursor-move p-1 hover:bg-gray-100 rounded"
              onMouseDown={handleMouseDown}
            >
              <Move className="w-4 h-4" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LotSelector 
            lots={lots}
            selectedLotId={selectedLotId}
            onLotSelect={onLotSelect}
          />

          {selectedLot && (
            <SelectedLotInfo selectedLot={selectedLot} />
          )}

          <DrawingControls
            selectedLotId={selectedLotId}
            isDrawing={isDrawing}
            hasPolygon={hasPolygon}
            onStartDrawing={onStartDrawing}
            onDeletePolygon={onDeletePolygon}
            onCancelDrawing={onCancelDrawing}
          />
        </CardContent>
      </Card>

      <PolygonList
        lots={lots}
        lotPolygons={lotPolygons}
        onDeletePolygon={onDeletePolygon}
      />
    </>
  );
};

export default MapDrawingControls;

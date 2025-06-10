
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripHorizontal } from 'lucide-react';
import { LOT_COLORS } from './mapConstants';
import { useDraggable } from '@/hooks/useDraggable';
import { type Lot } from '@/stores/lotStore';
import { CurrentLotInfo } from './components/CurrentLotInfo';
import { DrawingInstructions } from './components/DrawingInstructions';
import { LotSelectionPanel } from './components/LotSelectionPanel';
import { PolygonControls } from './components/PolygonControls';
import { ColorSelection } from './components/ColorSelection';
import { InstructionsPanel } from './components/InstructionsPanel';

interface PolygonDrawerProps {
  lots: Lot[];
  selectedLot: Lot | null;
  onLotSelect: (lot: Lot) => void;
  onStartDrawing: () => void;
  onSavePolygon: () => void;
  onDeletePolygon: () => void;
  onColorChange: (color: string) => void;
  onCancelDrawing: () => void;
  isDrawing: boolean;
  hasPolygon?: boolean;
  currentColor?: string;
}

export const PolygonDrawer = ({
  lots,
  selectedLot,
  onLotSelect,
  onStartDrawing,
  onSavePolygon,
  onDeletePolygon,
  onColorChange,
  onCancelDrawing,
  isDrawing,
  hasPolygon = false,
  currentColor = LOT_COLORS.default
}: PolygonDrawerProps) => {
  const { position, dragRef, handleMouseDown, isDragging } = useDraggable({ x: 20, y: 100 });

  return (
    <Card 
      ref={dragRef}
      className="absolute z-30 shadow-xl max-w-sm bg-background/95 backdrop-blur-sm cursor-move"
      style={{ 
        left: position.x, 
        top: position.y,
        opacity: isDragging ? 0.8 : 1 
      }}
    >
      <CardHeader 
        className="pb-3 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <CardTitle className="text-sm flex items-center">
          <GripHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
          Diseño de Lotes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Lot Info */}
        {selectedLot && (
          <CurrentLotInfo 
            selectedLot={selectedLot} 
            hasPolygon={hasPolygon} 
            currentColor={currentColor} 
          />
        )}

        {/* Drawing Instructions */}
        {isDrawing && (
          <DrawingInstructions
            selectedLot={selectedLot}
            onSavePolygon={onSavePolygon}
            onCancelDrawing={onCancelDrawing}
          />
        )}

        {/* Lot Selection */}
        {!isDrawing && (
          <LotSelectionPanel
            lots={lots}
            selectedLot={selectedLot}
            onLotSelect={onLotSelect}
          />
        )}

        {/* Drawing & Management Controls */}
        {selectedLot && !isDrawing && (
          <>
            <PolygonControls
              hasPolygon={hasPolygon}
              onStartDrawing={onStartDrawing}
              onDeletePolygon={onDeletePolygon}
            />

            {/* Color Selection - Only show if polygon exists */}
            {hasPolygon && (
              <ColorSelection
                currentColor={currentColor}
                onColorChange={onColorChange}
              />
            )}
          </>
        )}

        {/* Instructions */}
        {!isDrawing && !selectedLot && <InstructionsPanel />}
      </CardContent>
    </Card>
  );
};

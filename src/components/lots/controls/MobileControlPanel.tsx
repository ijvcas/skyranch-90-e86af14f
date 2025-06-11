
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Map, Layers, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import LotSelector from './LotSelector';
import SelectedLotInfo from './SelectedLotInfo';
import DrawingControls from './DrawingControls';
import MapLotLabelsControl from './MapLotLabelsControl';

interface MobileControlPanelProps {
  lots: Lot[];
  selectedLotId: string;
  isDrawing: boolean;
  polygons: Array<{ lotId: string; color: string; areaHectares?: number }>;
  onStartDrawing: (lotId: string) => void;
  onStopDrawing: () => void;
  onDeletePolygon: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
  onLotSelect: (lotId: string) => void;
  showLabels: boolean;
  onToggleLabels: (show: boolean) => void;
  showPropertyName: boolean;
  onTogglePropertyName: (show: boolean) => void;
}

const MobileControlPanel = ({
  lots,
  selectedLotId,
  isDrawing,
  polygons,
  onStartDrawing,
  onStopDrawing,
  onDeletePolygon,
  getLotColor,
  onLotSelect,
  showLabels,
  onToggleLabels,
  showPropertyName,
  onTogglePropertyName
}: MobileControlPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMapControlsOpen, setIsMapControlsOpen] = useState(false);
  
  const selectedLot = lots.find(l => l.id === selectedLotId);
  const hasPolygon = polygons.some(p => p.lotId === selectedLotId);

  return (
    <>
      {/* Main Control Panel - Bottom Sheet Style */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t safe-area-pb">
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center space-x-2"
          >
            <Map className="w-4 h-4" />
            <span className="font-medium">Controles de Lotes</span>
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          
          <Sheet open={isMapControlsOpen} onOpenChange={setIsMapControlsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Layers className="w-4 h-4 mr-2" />
                Etiquetas
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[40vh]">
              <SheetHeader>
                <SheetTitle>Configuración del Mapa</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <MapLotLabelsControl
                  showLabels={showLabels}
                  onToggleLabels={onToggleLabels}
                  showPropertyName={showPropertyName}
                  onTogglePropertyName={onTogglePropertyName}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {!isCollapsed && (
          <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto mobile-scroll">
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
              onCancelDrawing={onStopDrawing}
            />
          </div>
        )}
      </div>

      {/* Quick Action Buttons - Floating */}
      {selectedLotId && !isDrawing && (
        <div className="fixed bottom-24 right-4 z-20 flex flex-col space-y-2">
          <Button
            onClick={() => onStartDrawing(selectedLotId)}
            className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 shadow-lg mobile-tap-target"
            disabled={hasPolygon}
          >
            <Map className="w-6 h-6" />
          </Button>
        </div>
      )}

      {isDrawing && (
        <div className="fixed bottom-24 right-4 z-20 flex flex-col space-y-2">
          <Button
            onClick={onStopDrawing}
            variant="destructive"
            className="rounded-full w-14 h-14 shadow-lg mobile-tap-target"
          >
            <ChevronDown className="w-6 h-6" />
          </Button>
        </div>
      )}
    </>
  );
};

export default MobileControlPanel;

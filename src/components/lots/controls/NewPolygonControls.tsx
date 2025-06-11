
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Square, 
  Move, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Circle
} from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface NewPolygonControlsProps {
  lots: Lot[];
  selectedLotId: string;
  drawingState: {
    isActive: boolean;
    currentLotId: string | null;
    mode: 'idle' | 'drawing' | 'complete';
  };
  polygons: Array<{ lotId: string; color: string }>;
  onStartDrawing: (lotId: string) => void;
  onStopDrawing: () => void;
  onDeletePolygon: (lotId: string) => void;
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
}

const NewPolygonControls = ({
  lots,
  selectedLotId,
  drawingState,
  polygons,
  onStartDrawing,
  onStopDrawing,
  onDeletePolygon,
  onLotSelect,
  getLotColor
}: NewPolygonControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const controlRef = useRef<HTMLDivElement>(null);
  const selectedLot = lots.find(l => l.id === selectedLotId);
  const hasPolygon = polygons.some(p => p.lotId === selectedLotId);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!controlRef.current) return;
    
    const rect = controlRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
    document.body.style.userSelect = 'none';
  };

  // Handle dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      setPosition({
        x: Math.max(0, Math.min(newX, window.innerWidth - 320)),
        y: Math.max(0, Math.min(newY, window.innerHeight - 400))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'resting': return 'bg-amber-100 text-amber-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'resting': return 'Descanso';
      case 'maintenance': return 'Mantenimiento';
      default: return status;
    }
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="absolute top-4 left-4 z-30 bg-white shadow-lg hover:shadow-xl transition-shadow border"
        variant="outline"
        size="sm"
      >
        <Square className="w-4 h-4 mr-2" />
        Mostrar Controles
      </Button>
    );
  }

  return (
    <Card 
      ref={controlRef}
      className={`absolute w-80 z-30 shadow-lg transition-all ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${drawingState.isActive ? 'border-blue-400 bg-blue-50/90' : 'bg-white/95'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Square className="w-5 h-5 mr-2 text-green-600" />
            <span className="font-semibold">Control de Polígonos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 p-0"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <div 
              className="cursor-move p-2 hover:bg-gray-100 rounded-md transition-colors"
              onMouseDown={handleMouseDown}
            >
              <Move className="w-4 h-4 text-gray-600" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 hover:bg-red-100 text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4 p-4">
          {/* Lot Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Lote</label>
            <Select value={selectedLotId} onValueChange={onLotSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un lote" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Circle 
                          className="w-3 h-3 mr-2" 
                          style={{ fill: getLotColor(lot), color: getLotColor(lot) }}
                        />
                        <span>{lot.name}</span>
                      </div>
                      <Badge className={`ml-2 text-xs ${getStatusColor(lot.status)}`}>
                        {getStatusLabel(lot.status)}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Lot Info */}
          {selectedLot && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedLot.name}</h4>
                <Badge className={`${getStatusColor(selectedLot.status)} text-xs`}>
                  {getStatusLabel(selectedLot.status)}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Circle 
                  className="w-3 h-3 mr-2" 
                  style={{ 
                    fill: getLotColor(selectedLot), 
                    color: getLotColor(selectedLot)
                  }} 
                />
                <span>Color del polígono</span>
              </div>
            </div>
          )}

          {/* Drawing Controls */}
          <div className="space-y-3">
            {!drawingState.isActive ? (
              <div className="space-y-2">
                <Button
                  onClick={() => selectedLotId && onStartDrawing(selectedLotId)}
                  disabled={!selectedLotId}
                  className={`w-full ${
                    hasPolygon 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {hasPolygon ? 'Redibujar Polígono' : 'Dibujar Polígono'}
                </Button>
                
                {hasPolygon && (
                  <Button
                    onClick={() => onDeletePolygon(selectedLotId)}
                    variant="destructive"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Polígono
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    <p className="text-sm font-medium text-blue-800">
                      Modo Dibujo Activo
                    </p>
                  </div>
                  <p className="text-xs text-blue-700">
                    Haz clic en el mapa para crear puntos del polígono. 
                    Cierra el polígono haciendo clic en el primer punto.
                  </p>
                </div>
                
                <Button
                  onClick={onStopDrawing}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Dibujo
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="pt-3 border-t">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total de lotes:</span>
              <span className="font-medium">{lots.length}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Polígonos dibujados:</span>
              <span className="font-medium text-green-600">{polygons.length}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NewPolygonControls;

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
  Circle,
  Eye,
  EyeOff
} from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface ElegantPolygonControlsProps {
  lots: Lot[];
  selectedLotId: string;
  drawingState: {
    isActive: boolean;
    currentLotId: string | null;
    mode: 'idle' | 'drawing' | 'editing' | 'complete';
  };
  polygons: Array<{ lotId: string; color: string }>;
  onStartDrawing: (lotId: string) => void;
  onCancelDrawing: () => void;
  onDeletePolygon: (lotId: string) => void;
  onLotSelect: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
}

const ElegantPolygonControls = ({
  lots,
  selectedLotId,
  drawingState,
  polygons,
  onStartDrawing,
  onCancelDrawing,
  onDeletePolygon,
  onLotSelect,
  getLotColor
}: ElegantPolygonControlsProps) => {
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
    
    // Prevent text selection
    e.preventDefault();
    document.body.style.userSelect = 'none';
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 320; // Control width
      const maxY = window.innerHeight - 400; // Control height
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
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
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'resting': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <>
        {/* Floating show button */}
        <Button
          onClick={() => setIsVisible(true)}
          className="fixed top-4 left-4 z-30 bg-white shadow-lg hover:shadow-xl transition-shadow border"
          variant="outline"
          size="sm"
        >
          <Square className="w-4 h-4 mr-2" />
          Mostrar Controles
        </Button>
        
        {/* Polygon mini-list */}
        {polygons.length > 0 && (
          <div className="fixed bottom-4 right-4 z-30">
            <Card className="w-48 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">
                  <Circle className="w-3 h-3 mr-2" />
                  Polígonos ({polygons.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 max-h-32 overflow-y-auto">
                {polygons.map((p) => {
                  const lot = lots.find(l => l.id === p.lotId);
                  return lot ? (
                    <div key={p.lotId} className="flex items-center text-xs">
                      <Circle 
                        className="w-2 h-2 mr-2" 
                        style={{ fill: p.color, color: p.color }} 
                      />
                      <span className="truncate">{lot.name}</span>
                    </div>
                  ) : null;
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </>
    );
  }

  return (
    <Card 
      ref={controlRef}
      className={`fixed w-80 z-30 shadow-2xl transition-all duration-300 border-2 ${
        isDragging ? 'cursor-grabbing shadow-3xl scale-105' : 'cursor-grab'
      } ${drawingState.isActive ? 'border-blue-400 bg-blue-50/80' : 'border-gray-200 bg-white/95'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        backdropFilter: 'blur(8px)',
        transform: isDragging ? 'rotate(2deg)' : 'rotate(0deg)'
      }}
    >
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-green-50 to-blue-50">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Square className="w-5 h-5 mr-2 text-green-600" />
            <span className="font-semibold text-gray-800">Control de Polígonos</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-6 w-6 p-0 hover:bg-white/60"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
            <div 
              className="cursor-move p-2 hover:bg-white/60 rounded-md transition-colors"
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
            <label className="text-sm font-medium text-gray-700">Seleccionar Lote</label>
            <Select value={selectedLotId} onValueChange={onLotSelect}>
              <SelectTrigger className="border-2 transition-colors focus:border-green-400">
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
            <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{selectedLot.name}</h4>
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
              {selectedLot.sizeHectares && (
                <div className="text-sm text-gray-600 mt-1">
                  Tamaño: {selectedLot.sizeHectares} hectáreas
                </div>
              )}
            </div>
          )}

          {/* Drawing Controls */}
          <div className="space-y-3">
            {!drawingState.isActive ? (
              <div className="space-y-2">
                <Button
                  onClick={() => selectedLotId && onStartDrawing(selectedLotId)}
                  disabled={!selectedLotId}
                  className={`w-full transition-all duration-200 ${
                    hasPolygon 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {hasPolygon ? 'Redibujar Polígono' : 'Dibujar Polígono'}
                </Button>
                
                {hasPolygon && (
                  <Button
                    onClick={() => onDeletePolygon(selectedLotId)}
                    variant="destructive"
                    className="w-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Polígono
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                    <p className="text-sm font-medium text-blue-800">
                      Modo Dibujo Activo
                    </p>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Haz clic en el mapa para crear puntos del polígono. 
                    Cierra el polígono haciendo clic en el primer punto.
                  </p>
                </div>
                
                <Button
                  onClick={onCancelDrawing}
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar Dibujo
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="pt-3 border-t border-gray-200">
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

export default ElegantPolygonControls;

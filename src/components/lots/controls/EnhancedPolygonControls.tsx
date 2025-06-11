
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Square, Edit, Trash2, Circle, X, ChevronDown, ChevronUp, Minimize2, BarChart3, Palette, MapPin } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';
import { usePolygonUtils } from '@/hooks/polygon/usePolygonUtils';

interface PolygonData {
  lotId: string;
  color: string;
  colorType: string;
  areaHectares?: number;
}

interface EnhancedPolygonControlsProps {
  lots: Lot[];
  selectedLotId: string;
  isDrawing: boolean;
  polygons: PolygonData[];
  onStartDrawing: (lotId: string, colorType: string) => void;
  onStopDrawing: () => void;
  onDeletePolygon: (lotId: string) => void;
  getLotColor: (lot: Lot) => string;
}

const EnhancedPolygonControls = ({
  lots,
  selectedLotId,
  isDrawing,
  polygons,
  onStartDrawing,
  onStopDrawing,
  onDeletePolygon,
  getLotColor
}: EnhancedPolygonControlsProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentLotId, setCurrentLotId] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const { formatArea } = usePolygonUtils();
  
  const selectedLot = lots.find(l => l.id === currentLotId);
  const polygonData = polygons.find(p => p.lotId === currentLotId);
  const hasPolygon = !!polygonData;

  // Color options for different lot statuses
  const colorOptions = [
    { value: 'active', label: 'En Uso', color: '#10b981' },
    { value: 'resting', label: 'Descanso', color: '#f59e0b' },
    { value: 'breeding', label: 'Reproducción', color: '#8b5cf6' },
    { value: 'maintenance', label: 'Mantenimiento', color: '#ef4444' },
    { value: 'property', label: 'Propiedad', color: '#ffffff' }
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'resting': return 'Descanso';
      case 'maintenance': return 'Mantenimiento';
      case 'breeding': return 'Reproducción';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'resting': return 'bg-amber-100 text-amber-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      case 'breeding': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartDrawing = () => {
    if (currentLotId && selectedColor) {
      onStartDrawing(currentLotId, selectedColor);
    }
  };

  if (isMinimized) {
    return (
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className="bg-white/95 shadow-lg"
        >
          <Square className="w-4 h-4 mr-2 text-green-600" />
          Dibujar Polígonos
        </Button>
      </div>
    );
  }

  return (
    <Card className="absolute bottom-4 left-4 w-80 z-[1000] shadow-lg bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Square className="w-5 h-5 mr-2 text-green-600" />
            Dibujar Polígonos
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="h-6 w-6 p-0"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Step 1: Lot Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              1. Seleccionar Lote
            </label>
            <Select value={currentLotId} onValueChange={setCurrentLotId} disabled={isDrawing}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un lote" />
              </SelectTrigger>
              <SelectContent className="bg-white z-[1001]">
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

          {/* Step 2: Color Selector */}
          {currentLotId && (
            <div className="space-y-3">
              <div className="flex items-center">
                <Palette className="w-4 h-4 mr-2 text-gray-600" />
                <label className="text-sm font-medium">2. Color del Polígono</label>
              </div>
              <RadioGroup 
                value={selectedColor} 
                onValueChange={setSelectedColor}
                className="grid grid-cols-1 gap-2"
                disabled={isDrawing}
              >
                {colorOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 p-2 rounded-lg border hover:bg-gray-50">
                    <RadioGroupItem value={option.value} id={option.value} disabled={isDrawing} />
                    <div className="flex items-center flex-1">
                      <div 
                        className="w-4 h-4 rounded border mr-3"
                        style={{ 
                          backgroundColor: option.color,
                          border: option.color === '#ffffff' ? '1px solid #d1d5db' : 'none'
                        }}
                      />
                      <label 
                        htmlFor={option.value} 
                        className="text-sm font-medium cursor-pointer flex-1"
                      >
                        {option.label}
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Selected Lot Info */}
          {selectedLot && (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{selectedLot.name}</h4>
                <Badge className={`${getStatusColor(selectedLot.status)} text-xs`}>
                  {getStatusLabel(selectedLot.status)}
                </Badge>
              </div>
              <div className="space-y-2">
                {selectedColor && (
                  <div className="flex items-center text-sm text-gray-600">
                    <div 
                      className="w-3 h-3 rounded mr-2"
                      style={{ 
                        backgroundColor: colorOptions.find(c => c.value === selectedColor)?.color,
                        border: selectedColor === 'property' ? '1px solid #d1d5db' : 'none'
                      }}
                    />
                    <span>Color: {colorOptions.find(c => c.value === selectedColor)?.label}</span>
                  </div>
                )}
                {polygonData?.areaHectares && (
                  <div className="flex items-center text-sm text-green-700 font-medium">
                    <BarChart3 className="w-3 h-3 mr-2" />
                    <span>Área: {formatArea(polygonData.areaHectares)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Drawing Controls */}
          <div className="space-y-3">
            {!isDrawing ? (
              <div className="space-y-2">
                <Button
                  onClick={handleStartDrawing}
                  disabled={!currentLotId || !selectedColor}
                  className={`w-full ${
                    hasPolygon 
                      ? 'bg-amber-500 hover:bg-amber-600' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {hasPolygon ? '3. Redibujar Polígono' : '3. Dibujar Polígono'}
                </Button>
                
                {!selectedColor && currentLotId && (
                  <p className="text-xs text-amber-600 text-center">
                    Selecciona un color para continuar
                  </p>
                )}
                
                {hasPolygon && (
                  <Button
                    onClick={() => onDeletePolygon(currentLotId)}
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
          <div className="pt-3 border-t space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Polígonos dibujados:</span>
              <span className="font-medium text-green-600">{polygons.length}</span>
            </div>
            {polygons.length > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Área total:</span>
                <span className="font-medium text-green-600">
                  {formatArea(polygons.reduce((sum, p) => sum + (p.areaHectares || 0), 0))}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedPolygonControls;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users } from 'lucide-react';
import { type Lot } from '@/stores/lotStore';

interface LotMapViewProps {
  lots: Lot[];
  onLotSelect: (lotId: string) => void;
}

const LotMapView = ({ lots, onLotSelect }: LotMapViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'resting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGrassConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'border-green-500';
      case 'good': return 'border-green-400';
      case 'fair': return 'border-yellow-400';
      case 'poor': return 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Vista de Mapa de Lotes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No hay lotes para mostrar en el mapa</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {lots.map((lot) => (
                <div
                  key={lot.id}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 ${getGrassConditionColor(lot.grassCondition)} hover:scale-105`}
                  onClick={() => onLotSelect(lot.id)}
                >
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={getStatusColor(lot.status)} variant="outline">
                      {lot.status === 'active' ? 'Activo' : 
                       lot.status === 'resting' ? 'Descanso' : 'Mantenimiento'}
                    </Badge>
                  </div>

                  {/* Lot Info */}
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-lg">{lot.name}</h3>
                    
                    {/* Animal Count */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-1" />
                        Animales
                      </div>
                      <span className="text-sm font-medium">
                        {lot.currentAnimals || 0}
                        {lot.capacity && ` / ${lot.capacity}`}
                      </span>
                    </div>

                    {/* Capacity Bar */}
                    {lot.capacity && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{
                            width: `${Math.min(((lot.currentAnimals || 0) / lot.capacity) * 100, 100)}%`
                          }}
                        />
                      </div>
                    )}

                    {/* Size Info */}
                    {lot.sizeHectares && (
                      <div className="text-xs text-gray-500">
                        {lot.sizeHectares} hectáreas
                      </div>
                    )}

                    {/* Grass Condition Indicator */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Pasto:</span>
                      <div className="flex items-center">
                        <div 
                          className={`w-2 h-2 rounded-full mr-1 ${
                            lot.grassCondition === 'excellent' ? 'bg-green-500' :
                            lot.grassCondition === 'good' ? 'bg-green-400' :
                            lot.grassCondition === 'fair' ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                        />
                        <span className="text-xs capitalize">{lot.grassCondition}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual representation of lot occupancy */}
                  <div className="mt-3 h-16 bg-gray-50 rounded border-2 border-dashed border-gray-200 flex items-center justify-center">
                    {lot.currentAnimals && lot.currentAnimals > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-full">
                        {Array.from({ length: Math.min(lot.currentAnimals, 12) }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-2 h-2 bg-green-600 rounded-full"
                          />
                        ))}
                        {(lot.currentAnimals || 0) > 12 && (
                          <span className="text-xs text-gray-500">+{(lot.currentAnimals || 0) - 12}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Vacío</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Estado del Lote</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span className="text-sm">Activo</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2"></div>
                  <span className="text-sm">En Descanso</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                  <span className="text-sm">Mantenimiento</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Condición del Pasto</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-green-500 rounded mr-2"></div>
                  <span className="text-sm">Excelente</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-green-400 rounded mr-2"></div>
                  <span className="text-sm">Buena</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-yellow-400 rounded mr-2"></div>
                  <span className="text-sm">Regular</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-red-400 rounded mr-2"></div>
                  <span className="text-sm">Pobre</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LotMapView;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, Map } from 'lucide-react';

export type MapViewMode = 'property' | 'pasture' | 'combined';

interface LotMapViewModeControlsProps {
  viewMode: MapViewMode;
  onViewModeChange: (mode: MapViewMode) => void;
  propertyLotsCount: number;
  pastureLotsCount: number;
}

const LotMapViewModeControls: React.FC<LotMapViewModeControlsProps> = ({
  viewMode,
  onViewModeChange,
  propertyLotsCount,
  pastureLotsCount
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Vista del Mapa</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === 'property' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('property')}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Propiedad ({propertyLotsCount})
            </Button>
            
            <Button
              variant={viewMode === 'pasture' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('pasture')}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Pastoreo ({pastureLotsCount})
            </Button>
            
            <Button
              variant={viewMode === 'combined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('combined')}
              className="flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              Combinado
            </Button>
          </div>
          
          <div className="text-xs text-gray-500">
            {viewMode === 'property' && 'Mostrando solo límites de propiedad (no editables)'}
            {viewMode === 'pasture' && 'Modo diseño de pastoreo (editables)'}
            {viewMode === 'combined' && 'Mostrando ambos tipos de lotes'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LotMapViewModeControls;

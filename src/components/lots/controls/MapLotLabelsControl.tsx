
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Minimize2, MapPin, Layers, Building, Leaf } from 'lucide-react';

interface MapLotLabelsControlProps {
  showLabels: boolean;
  onToggleLabels: (show: boolean) => void;
  showPropertyName: boolean;
  onTogglePropertyName: (show: boolean) => void;
  showPropertyLots: boolean;
  onTogglePropertyLots: (show: boolean) => void;
  showPastureLots: boolean;
  onTogglePastureLots: (show: boolean) => void;
}

const MapLotLabelsControl = ({
  showLabels,
  onToggleLabels,
  showPropertyName,
  onTogglePropertyName,
  showPropertyLots,
  onTogglePropertyLots,
  showPastureLots,
  onTogglePastureLots
}: MapLotLabelsControlProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  if (isMinimized) {
    return (
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 translate-x-40 z-20">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className="bg-white/95 shadow-lg"
        >
          <Layers className="w-4 h-4 mr-2" />
          Etiquetas
        </Button>
      </div>
    );
  }

  return (
    <Card className="absolute top-4 left-1/2 transform -translate-x-1/2 translate-x-40 w-64 z-20 shadow-lg bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Layers className="w-5 h-5 mr-2" />
            Etiquetas
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-gray-500" />
              <Label htmlFor="show-property-lots">Lotes de Propiedad</Label>
            </div>
            <Switch 
              id="show-property-lots" 
              checked={showPropertyLots} 
              onCheckedChange={onTogglePropertyLots} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <Label htmlFor="show-pasture-lots">Lotes de Pastoreo</Label>
            </div>
            <Switch 
              id="show-pasture-lots" 
              checked={showPastureLots} 
              onCheckedChange={onTogglePastureLots} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <Label htmlFor="show-property-name">Nombre SkyRanch</Label>
            </div>
            <Switch 
              id="show-property-name" 
              checked={showPropertyName} 
              onCheckedChange={onTogglePropertyName} 
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MapLotLabelsControl;

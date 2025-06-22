
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COORDINATE_SYSTEMS } from '@/utils/coordinateTransform';

interface AdvancedOptionsSectionProps {
  manualCoordinateSystem: string;
  onManualCoordinateSystemChange: (value: string) => void;
}

const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  manualCoordinateSystem,
  onManualCoordinateSystemChange
}) => {
  return (
    <div className="space-y-3 p-3 border rounded-lg bg-gray-50">
      <div>
        <label className="block text-sm font-medium mb-2">
          Sistema de coordenadas manual
        </label>
        <Select value={manualCoordinateSystem} onValueChange={onManualCoordinateSystemChange}>
          <SelectTrigger>
            <SelectValue placeholder="Detectar automáticamente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Detectar automáticamente</SelectItem>
            {Object.entries(COORDINATE_SYSTEMS).map(([key, system]) => (
              <SelectItem key={key} value={key}>
                {system.name} ({key})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AdvancedOptionsSection;

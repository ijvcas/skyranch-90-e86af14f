
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Property } from '@/services/cadastralService';

interface PropertySelectorProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertyChange: (propertyId: string) => void;
  isLoading?: boolean;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedPropertyId,
  onPropertyChange,
  isLoading = false
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Propiedad</label>
      <Select value={selectedPropertyId} onValueChange={onPropertyChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar propiedad" />
        </SelectTrigger>
        <SelectContent>
          {properties.map((property) => (
            <SelectItem key={property.id} value={property.id}>
              <div className="flex items-center space-x-2">
                <span>{property.name}</span>
                {property.isMainProperty && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Principal
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertySelector;

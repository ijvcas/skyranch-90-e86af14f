
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import PropertySelector from './PropertySelector';
import ParcelStatusFilter from './ParcelStatusFilter';
import type { Property } from '@/services/cadastralService';
import type { ParcelStatus } from '@/utils/cadastral/types';

interface CadastralFilterControlsProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertyChange: (propertyId: string) => void;
  isLoading: boolean;
  statusFilter: ParcelStatus | 'ALL';
  onStatusFilterChange: (status: ParcelStatus | 'ALL') => void;
}

const CadastralFilterControls: React.FC<CadastralFilterControlsProps> = ({
  properties,
  selectedPropertyId,
  onPropertyChange,
  isLoading,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros y Selección</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PropertySelector
            properties={properties}
            selectedPropertyId={selectedPropertyId}
            onPropertyChange={onPropertyChange}
            isLoading={isLoading}
          />
          
          <ParcelStatusFilter
            selectedStatus={statusFilter}
            onStatusChange={onStatusFilterChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastralFilterControls;

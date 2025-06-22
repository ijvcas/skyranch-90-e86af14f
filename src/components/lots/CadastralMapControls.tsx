
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Upload } from 'lucide-react';
import PropertySelector from './PropertySelector';
import CadastralFileUpload from './CadastralFileUpload';
import ParcelStatusFilter from './ParcelStatusFilter';
import DeleteAllParcelsButton from './DeleteAllParcelsButton';
import type { Property } from '@/services/cadastralService';
import type { ParcelStatus } from '@/utils/cadastral/types';

interface CadastralMapControlsProps {
  properties: Property[];
  selectedPropertyId: string;
  onPropertyChange: (propertyId: string) => void;
  isLoading: boolean;
  showUpload: boolean;
  onToggleUpload: () => void;
  onFileUploadSuccess: () => void;
  onCancelUpload: () => void;
  statusFilter: ParcelStatus | 'ALL';
  onStatusFilterChange: (status: ParcelStatus | 'ALL') => void;
  onParcelsDeleted?: () => void;
}

const CadastralMapControls: React.FC<CadastralMapControlsProps> = ({
  properties,
  selectedPropertyId,
  onPropertyChange,
  isLoading,
  showUpload,
  onToggleUpload,
  onFileUploadSuccess,
  onCancelUpload,
  statusFilter,
  onStatusFilterChange,
  onParcelsDeleted
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Mapa Cadastral</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          
          <div className="flex space-x-2">
            <Button 
              onClick={onToggleUpload}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Importar XML/KML</span>
            </Button>
            
            {onParcelsDeleted && (
              <DeleteAllParcelsButton onDeleted={onParcelsDeleted} />
            )}
          </div>
        </div>

        {showUpload && (
          <CadastralFileUpload
            propertyId={selectedPropertyId}
            onSuccess={onFileUploadSuccess}
            onCancel={onCancelUpload}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CadastralMapControls;

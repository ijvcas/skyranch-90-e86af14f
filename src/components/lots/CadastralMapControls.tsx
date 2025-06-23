
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Upload } from 'lucide-react';
import PropertySelector from './PropertySelector';
import CadastralFileUpload from './CadastralFileUpload';
import ParcelStatusFilter from './ParcelStatusFilter';
import DeleteAllParcelsButton from './DeleteAllParcelsButton';
import type { Property, CadastralParcel } from '@/services/cadastralService';
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
  parcels?: CadastralParcel[];
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
  onParcelsDeleted,
  parcels = []
}) => {
  // Calculate total area for PROPIEDAD status parcels
  const calculatePropiedadTotalArea = (): number => {
    if (!parcels || parcels.length === 0) return 0;
    
    return parcels
      .filter(parcel => parcel.status === 'PROPIEDAD')
      .reduce((total, parcel) => total + (parcel.areaHectares || 0), 0);
  };

  const totalPropiedadArea = calculatePropiedadTotalArea();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Mapa Cadastral</span>
          </CardTitle>
          {totalPropiedadArea > 0 && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold">
                Total Área Propiedad: {totalPropiedadArea.toFixed(4)} ha
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
          
          <Button 
            onClick={onToggleUpload}
            variant="outline"
            size="sm"
            className="h-10 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Importar XML/KML</span>
          </Button>
          
          {onParcelsDeleted && (
            <DeleteAllParcelsButton onDeleted={onParcelsDeleted} />
          )}
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


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import CadastralFileUpload from './CadastralFileUpload';
import CadastralSettingsDropdown from './CadastralSettingsDropdown';
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
  selectedPropertyId,
  showUpload,
  onToggleUpload,
  onFileUploadSuccess,
  onCancelUpload,
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
            <span>Mapa Catastral</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            {totalPropiedadArea > 0 && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <span className="text-lg font-bold">
                  Área Total en Propiedad: {totalPropiedadArea.toFixed(4)} ha
                </span>
              </div>
            )}
            <CadastralSettingsDropdown
              onToggleUpload={onToggleUpload}
              onParcelsDeleted={onParcelsDeleted}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
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

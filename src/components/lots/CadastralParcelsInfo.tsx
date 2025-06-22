
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import type { CadastralParcel } from '@/services/cadastralService';

interface CadastralParcelsInfoProps {
  cadastralParcels: CadastralParcel[];
}

const CadastralParcelsInfo: React.FC<CadastralParcelsInfoProps> = ({
  cadastralParcels
}) => {
  if (cadastralParcels.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Parcelas Catastrales ({cadastralParcels.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cadastralParcels.map(parcel => (
            <div key={parcel.id} className="p-3 border rounded-lg">
              <h4 className="font-semibold">{parcel.parcelId}</h4>
              {parcel.areaHectares && (
                <p className="text-sm text-gray-600">
                  Área: {parcel.areaHectares.toFixed(2)} ha
                </p>
              )}
              {parcel.classification && (
                <p className="text-sm text-gray-600">
                  Clasificación: {parcel.classification}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CadastralParcelsInfo;

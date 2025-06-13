
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';

interface BreedingBasicInfoCardProps {
  record: BreedingRecord;
  animalNames: Record<string, string>;
}

const BreedingBasicInfoCard: React.FC<BreedingBasicInfoCardProps> = ({ record, animalNames }) => {
  const getMethodLabel = (method: BreedingRecord['breedingMethod']) => {
    const labels = {
      natural: 'Natural',
      artificial_insemination: 'Inseminación Artificial',
      embryo_transfer: 'Transferencia de Embriones'
    };
    return labels[method];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <span>Información Básica</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Madre</label>
            <p className="font-medium">{animalNames[record.motherId] || 'Desconocida'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Padre</label>
            <p className="font-medium">{animalNames[record.fatherId] || 'Desconocido'}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Método de Apareamiento</label>
          <p className="font-medium">{getMethodLabel(record.breedingMethod)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingBasicInfoCard;

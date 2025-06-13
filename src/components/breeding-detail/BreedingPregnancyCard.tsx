
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BreedingPregnancyCardProps {
  record: BreedingRecord;
}

const BreedingPregnancyCard: React.FC<BreedingPregnancyCardProps> = ({ record }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Baby className="w-5 h-5" />
          <span>Información del Embarazo</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Embarazo Confirmado</label>
          <p className="font-medium">{record.pregnancyConfirmed ? 'Sí' : 'No'}</p>
        </div>
        {record.pregnancyConfirmed && record.pregnancyConfirmationDate && (
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha de Confirmación</label>
            <p className="font-medium">
              {format(new Date(record.pregnancyConfirmationDate), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        )}
        {record.offspringCount > 0 && (
          <div>
            <label className="text-sm font-medium text-gray-500">Número de Crías</label>
            <p className="font-medium text-blue-600">{record.offspringCount}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingPregnancyCard;

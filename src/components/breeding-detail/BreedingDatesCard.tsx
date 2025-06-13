
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateActualGestationDuration } from '@/services/gestationService';

interface BreedingDatesCardProps {
  record: BreedingRecord;
}

const BreedingDatesCard: React.FC<BreedingDatesCardProps> = ({ record }) => {
  const gestationDuration = record.breedingDate && record.actualBirthDate 
    ? calculateActualGestationDuration(record.breedingDate, record.actualBirthDate)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="w-5 h-5" />
          <span>Fechas Importantes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {record.expectedDueDate && (
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha Esperada de Parto</label>
            <p className="font-medium text-blue-600">
              {format(new Date(record.expectedDueDate), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        )}
        {record.actualBirthDate && (
          <div>
            <label className="text-sm font-medium text-gray-500">Fecha Real de Parto</label>
            <p className="font-medium text-purple-600">
              {format(new Date(record.actualBirthDate), 'dd/MM/yyyy', { locale: es })}
            </p>
          </div>
        )}
        {gestationDuration && (
          <div>
            <label className="text-sm font-medium text-gray-500">Duración de Gestación</label>
            <p className="font-medium text-green-600">{gestationDuration} días</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingDatesCard;

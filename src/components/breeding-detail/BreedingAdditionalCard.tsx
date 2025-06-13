
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { BreedingRecord } from '@/services/breedingService';

interface BreedingAdditionalCardProps {
  record: BreedingRecord;
}

const BreedingAdditionalCard: React.FC<BreedingAdditionalCardProps> = ({ record }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5" />
          <span>Información Adicional</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {record.veterinarian && (
          <div>
            <label className="text-sm font-medium text-gray-500">Veterinario</label>
            <p className="font-medium">{record.veterinarian}</p>
          </div>
        )}
        {record.cost && (
          <div>
            <label className="text-sm font-medium text-gray-500">Costo</label>
            <p className="font-medium">${record.cost}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingAdditionalCard;

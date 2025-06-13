
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BreedingRecord } from '@/services/breedingService';

interface BreedingNotesCardProps {
  record: BreedingRecord;
}

const BreedingNotesCard: React.FC<BreedingNotesCardProps> = ({ record }) => {
  if (!record.breedingNotes) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap">{record.breedingNotes}</p>
      </CardContent>
    </Card>
  );
};

export default BreedingNotesCard;

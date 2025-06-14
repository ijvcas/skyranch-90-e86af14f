
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { Animal } from '@/stores/animalStore';

interface AnimalListStatsProps {
  animals: Animal[];
}

const AnimalListStats = ({ animals }: AnimalListStatsProps) => {
  if (animals.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{animals.length}</div>
          <div className="text-sm text-gray-600">Total Animales</div>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {animals.filter(a => a.healthStatus === 'healthy').length}
          </div>
          <div className="text-sm text-gray-600">Saludables</div>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {animals.filter(a => a.healthStatus === 'pregnant' || a.healthStatus === 'pregnant-healthy' || a.healthStatus === 'pregnant-sick').length}
          </div>
          <div className="text-sm text-gray-600">Gestantes</div>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {animals.filter(a => a.healthStatus === 'sick' || a.healthStatus === 'pregnant-sick').length}
          </div>
          <div className="text-sm text-gray-600">Enfermos</div>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {animals.filter(a => a.healthStatus === 'treatment').length}
          </div>
          <div className="text-sm text-gray-600">En Tratamiento</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalListStats;

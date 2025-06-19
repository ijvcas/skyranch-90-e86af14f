
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnimalNames } from '@/hooks/useAnimalNames';
import PedigreeChartLevel from '@/components/pedigree/PedigreeChartLevel';

interface AnimalPedigreeProps {
  animal: {
    id: string;
    name: string;
    tag: string;
    motherId?: string;
    fatherId?: string;
    maternalGrandmotherId?: string;
    maternalGrandfatherId?: string;
    paternalGrandmotherId?: string;
    paternalGrandfatherId?: string;
    // New great-grandparent fields
    maternalGreatGrandmotherMaternalId?: string;
    maternalGreatGrandfatherMaternalId?: string;
    maternalGreatGrandmotherPaternalId?: string;
    maternalGreatGrandfatherPaternalId?: string;
    paternalGreatGrandmotherMaternalId?: string;
    paternalGreatGrandfatherMaternalId?: string;
    paternalGreatGrandmotherPaternalId?: string;
    paternalGreatGrandfatherPaternalId?: string;
  };
}

const AnimalPedigreeChart: React.FC<AnimalPedigreeProps> = ({ animal }) => {
  const { getDisplayName, animalNamesMap } = useAnimalNames();

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const greatGrandparents = [
    { id: animal.maternalGreatGrandmotherMaternalId, label: "Bisabuela MM", gender: "female" as const },
    { id: animal.maternalGreatGrandfatherMaternalId, label: "Bisabuelo MM", gender: "male" as const },
    { id: animal.maternalGreatGrandmotherPaternalId, label: "Bisabuela MP", gender: "female" as const },
    { id: animal.maternalGreatGrandfatherPaternalId, label: "Bisabuelo MP", gender: "male" as const },
    { id: animal.paternalGreatGrandmotherMaternalId, label: "Bisabuela PM", gender: "female" as const },
    { id: animal.paternalGreatGrandfatherMaternalId, label: "Bisabuelo PM", gender: "male" as const },
    { id: animal.paternalGreatGrandmotherPaternalId, label: "Bisabuela PP", gender: "female" as const },
    { id: animal.paternalGreatGrandfatherPaternalId, label: "Bisabuelo PP", gender: "male" as const }
  ];

  const grandparents = [
    { id: animal.maternalGrandfatherId, label: "Abuelo Materno", gender: "male" as const },
    { id: animal.maternalGrandmotherId, label: "Abuela Materna", gender: "female" as const },
    { id: animal.paternalGrandfatherId, label: "Abuelo Paterno", gender: "male" as const },
    { id: animal.paternalGrandmotherId, label: "Abuela Paterna", gender: "female" as const }
  ];

  const parents = [
    { id: animal.motherId, label: "Madre", gender: "female" as const },
    { id: animal.fatherId, label: "Padre", gender: "male" as const }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Árbol Genealógico (3 Generaciones)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Great-Grandparents Level (3rd Generation) */}
          <PedigreeChartLevel
            animals={greatGrandparents}
            getDisplayName={getDisplayName}
            animalNamesMap={animalNamesMap}
            isValidUUID={isValidUUID}
            gridCols="grid-cols-8"
          />

          {/* Connection Lines to Grandparents */}
          <div className="relative">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
            </div>
          </div>

          {/* Grandparents Level (2nd Generation) */}
          <PedigreeChartLevel
            animals={grandparents}
            getDisplayName={getDisplayName}
            animalNamesMap={animalNamesMap}
            isValidUUID={isValidUUID}
            gridCols="grid-cols-4"
          />

          {/* Connection Lines to Parents */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
            </div>
          </div>

          {/* Parents Level (1st Generation) */}
          <PedigreeChartLevel
            animals={parents}
            getDisplayName={getDisplayName}
            animalNamesMap={animalNamesMap}
            isValidUUID={isValidUUID}
            gridCols="grid-cols-2"
          />

          {/* Connection to Current Animal */}
          <div className="relative">
            <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg mx-auto w-1/2"></div>
          </div>

          {/* Current Animal */}
          <div className="flex justify-center">
            <Card className="shadow-md border-2 border-green-500">
              <CardContent className="p-4">
                <div className="text-center">
                  <Badge variant="outline" className="mb-2">Animal Actual</Badge>
                  <div className="font-bold text-lg">{animal.name}</div>
                  <div className="text-sm text-gray-600">#{animal.tag}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Leyenda:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>MM:</strong> Maternal-Materno, <strong>MP:</strong> Maternal-Paterno</div>
            <div><strong>PM:</strong> Paternal-Materno, <strong>PP:</strong> Paternal-Paterno</div>
            <div className="text-blue-600">Externo: Animal no registrado en el sistema</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalPedigreeChart;

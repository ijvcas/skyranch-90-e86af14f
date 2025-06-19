
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimalNames } from '@/hooks/useAnimalNames';

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
  const navigate = useNavigate();
  const { getDisplayName, animalNamesMap } = useAnimalNames();

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const AnimalCard = ({ id, label, gender }: { id?: string; label: string; gender?: 'male' | 'female' }) => {
    const name = getDisplayName(id);
    const isRegisteredAnimal = id && isValidUUID(id) && animalNamesMap[id];
    
    if (!name) {
      return (
        <div className="p-2 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-xs">
          {label}
          <br />
          <span className="text-xs">No registrado</span>
        </div>
      );
    }

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-2">
          <div className="text-center">
            <div className="flex items-center justify-between mb-1">
              <Badge variant={gender === 'male' ? 'default' : 'secondary'} className="text-xs">
                {gender === 'male' ? '♂' : gender === 'female' ? '♀' : '?'}
              </Badge>
              {isRegisteredAnimal && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/animals/${id}`)}
                  className="h-5 w-5 p-0"
                >
                  <Eye className="w-2 h-2" />
                </Button>
              )}
            </div>
            <div className="font-medium text-xs truncate">{name}</div>
            <div className="text-xs text-gray-500">{label}</div>
            {!isRegisteredAnimal && (
              <div className="text-xs text-blue-600 mt-1">Externo</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Árbol Genealógico (3 Generaciones)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Great-Grandparents Level (3rd Generation) */}
          <div className="grid grid-cols-8 gap-1">
            <AnimalCard 
              id={animal.maternalGreatGrandmotherMaternalId} 
              label="Bisabuela MM" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.maternalGreatGrandfatherMaternalId} 
              label="Bisabuelo MM" 
              gender="male" 
            />
            <AnimalCard 
              id={animal.maternalGreatGrandmotherPaternalId} 
              label="Bisabuela MP" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.maternalGreatGrandfatherPaternalId} 
              label="Bisabuelo MP" 
              gender="male" 
            />
            <AnimalCard 
              id={animal.paternalGreatGrandmotherMaternalId} 
              label="Bisabuela PM" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.paternalGreatGrandfatherMaternalId} 
              label="Bisabuelo PM" 
              gender="male" 
            />
            <AnimalCard 
              id={animal.paternalGreatGrandmotherPaternalId} 
              label="Bisabuela PP" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.paternalGreatGrandfatherPaternalId} 
              label="Bisabuelo PP" 
              gender="male" 
            />
          </div>

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
          <div className="grid grid-cols-4 gap-2">
            <AnimalCard 
              id={animal.maternalGrandfatherId} 
              label="Abuelo Materno" 
              gender="male" 
            />
            <AnimalCard 
              id={animal.maternalGrandmotherId} 
              label="Abuela Materna" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.paternalGrandfatherId} 
              label="Abuelo Paterno" 
              gender="male" 
            />
            <AnimalCard 
              id={animal.paternalGrandmotherId} 
              label="Abuela Paterna" 
              gender="female" 
            />
          </div>

          {/* Connection Lines to Parents */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-6 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
            </div>
          </div>

          {/* Parents Level (1st Generation) */}
          <div className="grid grid-cols-2 gap-8">
            <AnimalCard 
              id={animal.motherId} 
              label="Madre" 
              gender="female" 
            />
            <AnimalCard 
              id={animal.fatherId} 
              label="Padre" 
              gender="male" 
            />
          </div>

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

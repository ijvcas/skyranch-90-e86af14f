
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  };
  animalNames: Record<string, string>;
}

const AnimalPedigreeChart: React.FC<AnimalPedigreeProps> = ({ animal, animalNames }) => {
  const navigate = useNavigate();

  // Helper function to check if a string is a valid UUID
  const isValidUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const getAnimalName = (id?: string) => {
    if (!id) return null;
    
    // If it's a UUID, try to get the registered animal name
    if (isValidUUID(id)) {
      return animalNames[id] || 'Animal no encontrado';
    }
    
    // If it's not a UUID, it's a text name, so return it as-is
    return id;
  };

  const AnimalCard = ({ id, label, gender }: { id?: string; label: string; gender?: 'male' | 'female' }) => {
    const name = getAnimalName(id);
    const isRegisteredAnimal = id && isValidUUID(id);
    
    if (!name) {
      return (
        <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
          {label}
          <br />
          <span className="text-xs">No registrado</span>
        </div>
      );
    }

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-3">
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
                  className="h-6 w-6 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="font-medium text-sm truncate">{name}</div>
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
        <CardTitle className="text-lg">Árbol Genealógico</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Grandparents Level */}
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

          {/* Connection Lines */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-8">
              <div className="h-8 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
              <div className="h-8 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg"></div>
            </div>
          </div>

          {/* Parents Level */}
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
            <div className="h-8 border-l-2 border-r-2 border-t-2 border-gray-300 rounded-t-lg mx-auto w-1/2"></div>
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
      </CardContent>
    </Card>
  );
};

export default AnimalPedigreeChart;

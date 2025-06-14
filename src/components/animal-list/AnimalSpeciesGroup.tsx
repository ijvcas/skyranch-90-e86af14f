
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getSpeciesText } from '@/utils/animalSpecies';
import AnimalCard from './AnimalCard';
import type { Animal } from '@/stores/animalStore';

interface AnimalSpeciesGroupProps {
  species: string;
  animals: Animal[];
  onDeleteAnimal: (animalId: string, animalName: string) => void;
}

const AnimalSpeciesGroup = ({ species, animals, onDeleteAnimal }: AnimalSpeciesGroupProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="shadow-lg">
      <Collapsible>
        <CollapsibleTrigger
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full"
        >
          <CardHeader className="hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center space-x-2">
                {isCollapsed ? (
                  <ChevronRight className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
                <span>{getSpeciesText(species)}</span>
                <Badge variant="secondary" className="ml-2">
                  {animals.length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {animals.map((animal) => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  onDelete={onDeleteAnimal}
                />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AnimalSpeciesGroup;

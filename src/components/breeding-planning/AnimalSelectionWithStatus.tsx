
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Animal } from '@/stores/animalStore';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';

interface AnimalSelectionWithStatusProps {
  animals: Animal[];
  selectedAnimalId: string;
  onAnimalSelect: (animalId: string) => void;
  placeholder: string;
  label: string;
}

const AnimalSelectionWithStatus: React.FC<AnimalSelectionWithStatusProps> = ({
  animals,
  selectedAnimalId,
  onAnimalSelect,
  placeholder,
  label
}) => {
  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Select value={selectedAnimalId} onValueChange={onAnimalSelect}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selectedAnimal && (
              <div className="flex items-center gap-2">
                <span>{selectedAnimal.name} ({selectedAnimal.tag})</span>
                <Badge className={getStatusColor(selectedAnimal.healthStatus)}>
                  {getStatusText(selectedAnimal.healthStatus)}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {animals.map((animal) => (
            <SelectItem key={animal.id} value={animal.id}>
              <div className="flex items-center gap-2 w-full">
                <span className="flex-1">{animal.name} ({animal.tag})</span>
                <Badge className={getStatusColor(animal.healthStatus)}>
                  {getStatusText(animal.healthStatus)}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AnimalSelectionWithStatus;

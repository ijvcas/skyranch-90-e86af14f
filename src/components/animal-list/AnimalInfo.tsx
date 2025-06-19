
import React from 'react';
import type { Animal } from '@/stores/animalStore';

interface AnimalInfoProps {
  animal: Animal;
}

const AnimalInfo: React.FC<AnimalInfoProps> = ({ animal }) => {
  return (
    <div className="space-y-2">
      {animal.breed && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Raza:</span>
          <span className="font-medium">{animal.breed}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Sexo:</span>
        <span className="font-medium">
          {animal.gender === 'macho' ? 'Macho' : animal.gender === 'hembra' ? 'Hembra' : 'No especificado'}
        </span>
      </div>
      {animal.weight && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Peso:</span>
          <span className="font-medium">{animal.weight} kg</span>
        </div>
      )}
    </div>
  );
};

export default AnimalInfo;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import { useImageTransform } from '@/components/animal-list/hooks/useImageTransform';
import AnimalImageEditor from '@/components/animal-list/AnimalImageEditor';
import type { Animal } from '@/stores/animalStore';

interface AnimalBasicInfoProps {
  animal: Animal;
}

const AnimalBasicInfo: React.FC<AnimalBasicInfoProps> = ({ animal }) => {
  const {
    isEditMode,
    currentTransform,
    savedTransform,
    displayTransform,
    updateMutation,
    handleImageTransform,
    handleSaveImage,
    handleEditClick,
    handleCancelEdit
  } = useImageTransform(animal);

  // Filter out image transform data from notes
  const getFilteredNotes = (notes: string | null) => {
    if (!notes) return '';
    return notes.replace(/\[Image Transform Data: .*?\]\n?/g, '').trim();
  };

  const filteredNotes = getFilteredNotes(animal.notes);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Información Básica
          <Badge className={`${getStatusColor(animal.healthStatus)}`}>
            {getStatusText(animal.healthStatus)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimalImageEditor
          animal={animal}
          isEditMode={isEditMode}
          currentTransform={currentTransform}
          savedTransform={savedTransform}
          displayTransform={displayTransform}
          updateMutationPending={updateMutation.isPending}
          onImageTransform={handleImageTransform}
          onEditClick={handleEditClick}
          onSaveImage={handleSaveImage}
          onCancelEdit={handleCancelEdit}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Especie</label>
            <p className="text-gray-900">{animal.species}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Raza</label>
            <p className="text-gray-900">{animal.breed || 'No especificada'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Género</label>
            <p className="text-gray-900">{animal.gender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Fecha de Nacimiento</label>
            <p className="text-gray-900">{animal.birthDate}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Peso</label>
            <p className="text-gray-900">{animal.weight} kg</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Color</label>
            <p className="text-gray-900">{animal.color}</p>
          </div>
        </div>

        {filteredNotes && (
          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600">Notas</label>
            <p className="text-gray-700 whitespace-pre-wrap mt-1">{filteredNotes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnimalBasicInfo;

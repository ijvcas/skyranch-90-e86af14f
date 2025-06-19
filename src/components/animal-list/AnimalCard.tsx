
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import { useImageTransform } from './hooks/useImageTransform';
import AnimalImageEditor from './AnimalImageEditor';
import AnimalInfo from './AnimalInfo';
import AnimalCardActions from './AnimalCardActions';
import type { Animal } from '@/stores/animalStore';

interface AnimalCardProps {
  animal: Animal;
  onDelete: (animalId: string, animalName: string) => void;
}

const AnimalCard = ({ animal, onDelete }: AnimalCardProps) => {
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

  return (
    <Card className="shadow hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-900">{animal.name}</CardTitle>
            <p className="text-sm text-gray-600">#{animal.tag}</p>
          </div>
          <Badge className={`${getStatusColor(animal.healthStatus)}`}>
            {getStatusText(animal.healthStatus)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
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
        
        <AnimalInfo animal={animal} />
        
        <AnimalCardActions
          animalId={animal.id}
          animalName={animal.name}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
};

export default AnimalCard;

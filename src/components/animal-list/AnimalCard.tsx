import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Save } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import { useAnimalStore } from '@/stores/animalStore';
import type { Animal } from '@/stores/animalStore';

interface AnimalCardProps {
  animal: Animal;
  onDelete: (animalId: string, animalName: string) => void;
}

const AnimalCard = ({ animal, onDelete }: AnimalCardProps) => {
  const navigate = useNavigate();
  const { updateAnimal } = useAnimalStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTransform, setCurrentTransform] = useState<any>(null);

  const handleImageTransform = (transform: any) => {
    setCurrentTransform(transform);
    console.log('Image transform applied:', transform);
  };

  const handleSaveImage = () => {
    // In a real implementation, you would apply the transforms to generate a new image
    // For now, we'll just update the animal record and exit edit mode
    if (currentTransform) {
      console.log('Saving image with transform:', currentTransform);
      // You could save the transform data to the animal record if needed
      // const updatedAnimal = { ...animal, imageTransform: currentTransform };
      // updateAnimal(animal.id, updatedAnimal);
    }
    setIsEditMode(false);
    setCurrentTransform(null);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

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
        {animal.image && (
          <div className="mb-4 relative">
            <EnhancedImageViewer
              src={animal.image}
              alt={animal.name}
              className="w-full h-32 rounded-lg"
              editMode={isEditMode}
              onTransformChange={handleImageTransform}
            />
            {!isEditMode && (
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-black/50 text-white hover:bg-black/70 h-8 w-8 p-0"
                  onClick={handleEditClick}
                  title="Edit Image"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
            {isEditMode && (
              <div className="absolute top-2 left-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-green-600/80 text-white hover:bg-green-700/80 h-8 w-8 p-0"
                  onClick={handleSaveImage}
                  title="Save Changes"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
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
        <div className="flex space-x-1 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/animals/${animal.id}`)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/animals/${animal.id}/edit`)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(animal.id, animal.name)}
            className="flex-1 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalCard;

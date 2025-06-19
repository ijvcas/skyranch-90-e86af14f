
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { getStatusColor, getStatusText } from '@/utils/animalStatus';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import type { Animal } from '@/stores/animalStore';

interface AnimalCardProps {
  animal: Animal;
  onDelete: (animalId: string, animalName: string) => void;
}

const AnimalCard = ({ animal, onDelete }: AnimalCardProps) => {
  const navigate = useNavigate();

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
          <div className="mb-4">
            <EnhancedImageViewer
              src={animal.image}
              alt={animal.name}
              className="w-full h-32 rounded-lg"
            />
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

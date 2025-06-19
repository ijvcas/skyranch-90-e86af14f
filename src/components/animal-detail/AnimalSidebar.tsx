import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import ImageEditorDialog from '@/components/image-editor/ImageEditorDialog';

interface AnimalSidebarProps {
  animal: {
    image?: string;
    name: string;
    tag: string;
    species: string;
    birthDate?: string;
    healthStatus: string;
    weight?: string;
  };
}

const AnimalSidebar: React.FC<AnimalSidebarProps> = ({ animal }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'sick':
        return 'bg-red-100 text-red-800';
      case 'pregnant':
        return 'bg-blue-100 text-blue-800';
      case 'treatment':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Saludable';
      case 'sick':
        return 'Enfermo';
      case 'pregnant':
        return 'Gestante';
      case 'treatment':
        return 'En Tratamiento';
      default:
        return 'Saludable';
    }
  };

  const getSpeciesText = (species: string) => {
    switch (species) {
      case 'bovino':
        return 'Bovino';
      case 'ovino':
        return 'Ovino';
      case 'caprino':
        return 'Caprino';
      case 'porcino':
        return 'Porcino';
      case 'equino':
        return 'Equino';
      case 'aviar':
        return 'Aviar';
      case 'canine':
        return 'Canino';
      default:
        return species.charAt(0).toUpperCase() + species.slice(1);
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = differenceInYears(now, birth);
    const months = differenceInMonths(now, birth) % 12;
    
    if (years === 0) {
      return `${months} mes${months !== 1 ? 'es' : ''}`;
    } else if (months === 0) {
      return `${years} año${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Image Card */}
      {animal.image && (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="relative">
              <EnhancedImageViewer
                src={animal.image}
                alt={animal.name}
                className="w-full h-64 rounded-t-lg"
              />
              <div className="absolute top-2 left-2">
                <ImageEditorDialog
                  src={animal.image}
                  alt={`Foto de ${animal.name}`}
                  trigger={
                    <Button size="sm" variant="outline" className="bg-black/50 text-white hover:bg-black/70 border-white/20">
                      <Edit className="w-4 h-4" />
                    </Button>
                  }
                />
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 text-center">Foto de {animal.name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ID/Tag:</span>
              <span className="font-medium">#{animal.tag}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Especie:</span>
              <span className="font-medium">{getSpeciesText(animal.species)}</span>
            </div>
            {animal.birthDate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium">{calculateAge(animal.birthDate)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Estado:</span>
              <Badge className={`${getStatusColor(animal.healthStatus)} text-xs`}>
                {getStatusText(animal.healthStatus)}
              </Badge>
            </div>
            {animal.weight && (
              <div className="flex justify-between">
                <span className="text-gray-600">Peso:</span>
                <span className="font-medium">{animal.weight} kg</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalSidebar;

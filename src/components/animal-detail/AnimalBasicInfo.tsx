
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Scale, Palette } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface AnimalBasicInfoProps {
  animal: {
    species: string;
    breed?: string;
    gender: string;
    healthStatus: string;
    birthDate?: string;
    weight?: string;
    color?: string;
  };
}

const AnimalBasicInfo: React.FC<AnimalBasicInfoProps> = ({ animal }) => {
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Información Básica
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Especie</label>
              <p className="text-lg font-semibold">{getSpeciesText(animal.species)}</p>
            </div>
            {animal.breed && (
              <div>
                <label className="text-sm font-medium text-gray-500">Raza</label>
                <p className="text-lg font-semibold">{animal.breed}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Género</label>
              <p className="text-lg font-semibold">
                {animal.gender === 'macho' ? 'Macho' : animal.gender === 'hembra' ? 'Hembra' : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado de Salud</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(animal.healthStatus)}`}>
                  {getStatusText(animal.healthStatus)}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {animal.birthDate && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Fecha de Nacimiento
                </label>
                <p className="text-lg font-semibold">
                  {format(new Date(animal.birthDate), 'dd/MM/yyyy', { locale: es })}
                </p>
                <p className="text-sm text-gray-600">
                  Edad: {calculateAge(animal.birthDate)}
                </p>
              </div>
            )}
            
            {animal.weight && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Scale className="w-4 h-4" />
                  Peso
                </label>
                <p className="text-lg font-semibold">{animal.weight} kg</p>
              </div>
            )}
            
            {animal.color && (
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  Color
                </label>
                <p className="text-lg font-semibold">{animal.color}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnimalBasicInfo;

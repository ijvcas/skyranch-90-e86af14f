
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Activity, AlertTriangle, Calendar } from 'lucide-react';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getHealthRecords } from '@/services/healthRecordService';
import EnhancedImageViewer from '@/components/image-editor/EnhancedImageViewer';
import ImageEditorDialog from '@/components/image-editor/ImageEditorDialog';

interface AnimalSidebarProps {
  animal: {
    id: string;
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
  const { data: healthRecords = [] } = useQuery({
    queryKey: ['health-records', animal.id],
    queryFn: () => getHealthRecords(animal.id)
  });

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

  // Get upcoming health events
  const upcomingEvents = healthRecords.filter(record => {
    if (!record.nextDueDate) return false;
    const dueDate = new Date(record.nextDueDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return dueDate <= thirtyDaysFromNow && dueDate >= new Date();
  });

  // Get recent records (last 30 days)
  const recentRecords = healthRecords.filter(record => {
    const recordDate = new Date(record.dateAdministered);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  });

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

      {/* Health Summary Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span>Resumen de Salud</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Registros:</span>
              <span className="font-medium">{healthRecords.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recientes (30d):</span>
              <span className="font-medium">{recentRecords.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Próximos:</span>
              <span className="font-medium flex items-center">
                {upcomingEvents.length}
                {upcomingEvents.length > 0 && (
                  <AlertTriangle className="w-4 h-4 ml-1 text-orange-500" />
                )}
              </span>
            </div>
          </div>

          {/* Upcoming Events Alert */}
          {upcomingEvents.length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <h5 className="font-medium text-orange-800 text-sm mb-2">
                Próximos Vencimientos:
              </h5>
              {upcomingEvents.slice(0, 2).map(record => (
                <div key={record.id} className="text-xs text-orange-700 mb-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className="truncate">{record.title}</span>
                  </div>
                  <div className="text-orange-600">
                    {format(new Date(record.nextDueDate!), 'dd/MM/yyyy', { locale: es })}
                  </div>
                </div>
              ))}
              {upcomingEvents.length > 2 && (
                <div className="text-xs text-orange-600 mt-1">
                  +{upcomingEvents.length - 2} más...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalSidebar;

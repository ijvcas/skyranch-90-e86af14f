
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Heart, Calendar, Scale, Palette } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnimal, getAllAnimals } from '@/services/animalService';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import AnimalDeleteDialog from '@/components/AnimalDeleteDialog';
import AnimalPedigreeChart from '@/components/AnimalPedigreeChart';

const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: animal, isLoading: isLoadingAnimal } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id,
  });

  const { data: allAnimals = [] } = useQuery({
    queryKey: ['animals', 'all-users'],
    queryFn: getAllAnimals,
  });

  // Create a map of animal IDs to names for the pedigree chart
  const animalNames = React.useMemo(() => {
    const nameMap: Record<string, string> = {};
    allAnimals.forEach(a => {
      nameMap[a.id] = `${a.name} (${a.tag})`;
    });
    return nameMap;
  }, [allAnimals]);

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">ID de animal no válido</div>
      </div>
    );
  }

  if (isLoadingAnimal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando información del animal...</div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animal no encontrado</h2>
          <p className="text-gray-600 mb-6">El animal solicitado no existe o no tienes permisos para verlo.</p>
          <Button onClick={() => navigate('/animals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/animals')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Animales
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {animal.name}
              </h1>
              <p className="text-gray-600">ID: #{animal.tag}</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                onClick={() => navigate(`/animals/${animal.id}/edit`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
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

            {/* Notes Card */}
            {animal.notes && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{animal.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Pedigree Chart */}
            <AnimalPedigreeChart animal={animal} animalNames={animalNames} />
          </div>

          {/* Sidebar - Image and Quick Stats */}
          <div className="space-y-6">
            {/* Image Card */}
            {animal.image && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
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
        </div>
      </div>

      {/* Delete Dialog */}
      <AnimalDeleteDialog
        animalId={animal.id}
        animalName={animal.name}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        redirectAfterDelete={true}
      />
    </div>
  );
};

export default AnimalDetail;

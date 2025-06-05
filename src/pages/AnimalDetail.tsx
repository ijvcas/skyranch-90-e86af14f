
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Weight, Palette, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnimal } from '@/services/animalService';

const AnimalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      return 'Menos de 1 mes';
    }
  };

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
      default:
        return species.charAt(0).toUpperCase() + species.slice(1);
    }
  };

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-lg text-gray-600 relative z-10">Cargando animal...</div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Animal no encontrado</h2>
          <p className="text-gray-600 mb-6">El animal que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate('/animals')}>
            Volver a Animales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
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
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm">
                  #{animal.tag}
                </Badge>
                <Badge className={`${getStatusColor(animal.healthStatus)}`}>
                  {getStatusText(animal.healthStatus)}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => navigate(`/animals/${id}/edit`)}
              className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Animal
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo */}
            {animal.image && (
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <img
                    src={animal.image}
                    alt={animal.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Especie</p>
                      <p className="font-medium">{getSpeciesText(animal.species)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm text-gray-600">Raza</p>
                      <p className="font-medium">{animal.breed || 'No especificada'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Edad</p>
                      <p className="font-medium">{calculateAge(animal.birthDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm text-gray-600">Sexo</p>
                      <p className="font-medium">{animal.gender === 'macho' ? 'Macho' : animal.gender === 'hembra' ? 'Hembra' : 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Weight className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Peso</p>
                      <p className="font-medium">{animal.weight ? `${animal.weight} kg` : 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Color/Marcas</p>
                      <p className="font-medium">{animal.color || 'No especificado'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pedigree Information */}
            {(animal.motherId || animal.fatherId) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Información de Pedigrí</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ID de la Madre</p>
                      <p className="font-medium">{animal.motherId || 'No registrada'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID del Padre</p>
                      <p className="font-medium">{animal.fatherId || 'No registrado'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {animal.notes && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{animal.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Stats */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Datos Clave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-medium">#{animal.tag}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Fecha de Nacimiento:</span>
                  <span className="font-medium">
                    {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : 'No registrada'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Registro:</span>
                  <span className="font-medium">Activo</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/animals/${id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Información
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimalDetail;


import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, Weight, Palette, Users, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAnimal } from '@/services/animalService';

const AnimalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id,
    retry: 3,
    retryDelay: 1000
  });

  console.log('Animal data loaded:', animal);

  // Query for parents using actual IDs from the animal record
  const { data: mother } = useQuery({
    queryKey: ['mother', animal?.motherId],
    queryFn: () => animal?.motherId && animal.motherId.trim() !== '' ? getAnimal(animal.motherId) : null,
    enabled: !!animal?.motherId && animal.motherId.trim() !== '',
    retry: 1
  });

  const { data: father } = useQuery({
    queryKey: ['father', animal?.fatherId],
    queryFn: () => animal?.fatherId && animal.fatherId.trim() !== '' ? getAnimal(animal.fatherId) : null,
    enabled: !!animal?.fatherId && animal.fatherId.trim() !== '',
    retry: 1
  });

  // Query grandparents using actual IDs from the animal record
  const { data: maternalGrandmother } = useQuery({
    queryKey: ['maternalGrandmother', animal?.maternalGrandmotherId],
    queryFn: () => animal?.maternalGrandmotherId && animal.maternalGrandmotherId.trim() !== '' ? getAnimal(animal.maternalGrandmotherId) : null,
    enabled: !!animal?.maternalGrandmotherId && animal.maternalGrandmotherId.trim() !== '',
    retry: 1
  });

  const { data: maternalGrandfather } = useQuery({
    queryKey: ['maternalGrandfather', animal?.maternalGrandfatherId],
    queryFn: () => animal?.maternalGrandfatherId && animal.maternalGrandfatherId.trim() !== '' ? getAnimal(animal.maternalGrandfatherId) : null,
    enabled: !!animal?.maternalGrandfatherId && animal.maternalGrandfatherId.trim() !== '',
    retry: 1
  });

  const { data: paternalGrandmother } = useQuery({
    queryKey: ['paternalGrandmother', animal?.paternalGrandmotherId],
    queryFn: () => animal?.paternalGrandmotherId && animal.paternalGrandmotherId.trim() !== '' ? getAnimal(animal.paternalGrandmotherId) : null,
    enabled: !!animal?.paternalGrandmotherId && animal.paternalGrandmotherId.trim() !== '',
    retry: 1
  });

  const { data: paternalGrandfather } = useQuery({
    queryKey: ['paternalGrandfather', animal?.paternalGrandfatherId],
    queryFn: () => animal?.paternalGrandfatherId && animal.paternalGrandfatherId.trim() !== '' ? getAnimal(animal.paternalGrandfatherId) : null,
    enabled: !!animal?.paternalGrandfatherId && animal.paternalGrandfatherId.trim() !== '',
    retry: 1
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
      case 'canine':
        return 'Canino';
      default:
        return species.charAt(0).toUpperCase() + species.slice(1);
    }
  };

  const PedigreeAnimalCard = ({ animal: pedigreeAnimal, label, level }: { animal: any; label: string; level: number }) => {
    if (!pedigreeAnimal) {
      return (
        <div className={`border-2 border-dashed border-gray-200 rounded-lg p-3 text-center ${level === 1 ? 'h-32' : 'h-24'}`}>
          <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
          <p className="text-xs text-gray-500">No registrado</p>
        </div>
      );
    }

    return (
      <div 
        className={`border border-gray-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow cursor-pointer ${level === 1 ? 'h-32' : 'h-24'}`}
        onClick={() => navigate(`/animals/${pedigreeAnimal.id}`)}
      >
        <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
        <div className="space-y-1">
          <p className="font-semibold text-sm text-gray-900">{pedigreeAnimal.name}</p>
          <p className="text-xs text-gray-600">#{pedigreeAnimal.tag}</p>
          <p className="text-xs text-gray-500">{getSpeciesText(pedigreeAnimal.species)}</p>
          {pedigreeAnimal.breed && (
            <p className="text-xs text-gray-500">{pedigreeAnimal.breed}</p>
          )}
        </div>
      </div>
    );
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
    console.error('Error loading animal:', error);
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
          <p className="text-gray-600 mb-6">El animal que buscas no existe o hubo un error al cargarlo.</p>
          <Button onClick={() => navigate('/animals')}>
            Volver a Animales
          </Button>
        </div>
      </div>
    );
  }

  // Check if we should show pedigree - look for actual ID values
  const hasParents = (animal.motherId && animal.motherId.trim() !== '') || (animal.fatherId && animal.fatherId.trim() !== '');
  const hasGrandparents = (animal.maternalGrandmotherId && animal.maternalGrandmotherId.trim() !== '') || 
                         (animal.maternalGrandfatherId && animal.maternalGrandfatherId.trim() !== '') ||
                         (animal.paternalGrandmotherId && animal.paternalGrandmotherId.trim() !== '') ||
                         (animal.paternalGrandfatherId && animal.paternalGrandfatherId.trim() !== '');

  console.log('Pedigree display logic:', { 
    hasParents, 
    hasGrandparents,
    motherId: animal.motherId,
    fatherId: animal.fatherId,
    maternalGrandmotherId: animal.maternalGrandmotherId,
    maternalGrandfatherId: animal.maternalGrandfatherId,
    paternalGrandmotherId: animal.paternalGrandmotherId,
    paternalGrandfatherId: animal.paternalGrandfatherId
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
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

            {/* Pedigree Chart - Show when we have parents or grandparents */}
            {(hasParents || hasGrandparents) && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900">Árbol Genealógico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Current Animal */}
                    <div className="text-center">
                      <div className="inline-block border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
                        <p className="text-sm text-blue-600 font-medium mb-1">Animal Actual</p>
                        <p className="font-bold text-lg text-blue-900">{animal.name}</p>
                        <p className="text-sm text-blue-700">#{animal.tag}</p>
                      </div>
                    </div>

                    {/* First Generation - Parents */}
                    {hasParents && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <PedigreeAnimalCard animal={mother} label="Madre" level={1} />
                        <PedigreeAnimalCard animal={father} label="Padre" level={1} />
                      </div>
                    )}

                    {/* Second Generation - Grandparents */}
                    {hasGrandparents && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 text-center">Abuelos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <PedigreeAnimalCard animal={maternalGrandmother} label="Abuela Materna" level={2} />
                          <PedigreeAnimalCard animal={maternalGrandfather} label="Abuelo Materno" level={2} />
                          <PedigreeAnimalCard animal={paternalGrandmother} label="Abuela Paterna" level={2} />
                          <PedigreeAnimalCard animal={paternalGrandfather} label="Abuelo Paterno" level={2} />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {animal.notes && animal.notes.trim() !== '' && (
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
                  onClick={() => navigate(`/animals/${id}/health`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Registros de Salud
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

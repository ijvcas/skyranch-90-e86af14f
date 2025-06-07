import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Edit, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AnimalDeleteDialog from '@/components/AnimalDeleteDialog';

const AnimalList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    animalId: string;
    animalName: string;
  }>({
    isOpen: false,
    animalId: '',
    animalName: ''
  });
  
  const { data: animals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['animals', 'all-users'], // Same key as Dashboard
    queryFn: getAllAnimals,
    enabled: !!user,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Force refresh function
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing animal list...');
    queryClient.clear();
    refetch();
    toast({
      title: "Actualizando lista",
      description: "Recargando todos los animales...",
    });
  };

  const handleDeleteClick = (animalId: string, animalName: string) => {
    setDeleteDialog({
      isOpen: true,
      animalId,
      animalName
    });
  };

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedSpecies, setSelectedSpecies] = React.useState('all');
  const [selectedStatus, setSelectedStatus] = React.useState('all');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = 
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecies = selectedSpecies === 'all' || animal.species === selectedSpecies;
    const matchesStatus = selectedStatus === 'all' || animal.healthStatus === selectedStatus;
    
    return matchesSearch && matchesSpecies && matchesStatus;
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
        <div className="text-center relative z-10">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">Cargando animales...</div>
          <div className="text-sm text-gray-500 mt-2">Usuario: {user?.email}</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading animals:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center relative z-10 max-w-md mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error al cargar animales</h2>
          <p className="text-gray-600 mb-4">Usuario: {user?.email}</p>
          <p className="text-gray-600 mb-6">Ocurrió un error al cargar la lista de animales.</p>
          <div className="space-y-2">
            <Button onClick={handleForceRefresh} className="bg-blue-600 hover:bg-blue-700 w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Recargar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4 pb-20 md:pb-4">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Todos los Animales</h1>
              <p className="text-gray-600">
                Gestiona y visualiza todos los animales del sistema
              </p>
              <div className="text-sm text-gray-500 mt-1">
                Usuario: {user?.email} | Total: {animals.length} animales
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleForceRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
              <Button 
                onClick={() => navigate('/animals/new')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Animal
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre o etiqueta..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las especies</SelectItem>
                      <SelectItem value="bovino">Bovino</SelectItem>
                      <SelectItem value="ovino">Ovino</SelectItem>
                      <SelectItem value="caprino">Caprino</SelectItem>
                      <SelectItem value="porcino">Porcino</SelectItem>
                      <SelectItem value="equino">Equino</SelectItem>
                      <SelectItem value="aviar">Aviar</SelectItem>
                      <SelectItem value="canine">Canino</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="healthy">Saludable</SelectItem>
                      <SelectItem value="sick">Enfermo</SelectItem>
                      <SelectItem value="pregnant">Gestante</SelectItem>
                      <SelectItem value="treatment">En Tratamiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Animals Grid */}
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron animales</h3>
            <p className="text-gray-500 mb-6">
              {animals.length === 0 
                ? `No hay animales registrados en el sistema para mostrar a ${user?.email}.`
                : "No hay animales que coincidan con los filtros seleccionados."
              }
            </p>
            <div className="space-y-2">
              {animals.length === 0 && (
                <div>
                  <Button onClick={handleForceRefresh} className="bg-blue-600 hover:bg-blue-700 mr-2">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Forzar Actualización
                  </Button>
                  <Button 
                    onClick={() => navigate('/animals/new')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Primer Animal
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimals.map((animal) => (
              <Card key={animal.id} className="shadow-lg hover:shadow-xl transition-shadow">
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
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Especie:</span>
                      <span className="font-medium">{getSpeciesText(animal.species)}</span>
                    </div>
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
                      onClick={() => handleDeleteClick(animal.id, animal.name)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {animals.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{animals.length}</div>
                <div className="text-sm text-gray-600">Total Animales</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {animals.filter(a => a.healthStatus === 'healthy').length}
                </div>
                <div className="text-sm text-gray-600">Saludables</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {animals.filter(a => a.healthStatus === 'sick').length}
                </div>
                <div className="text-sm text-gray-600">Enfermos</div>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {animals.filter(a => a.healthStatus === 'pregnant').length}
                </div>
                <div className="text-sm text-gray-600">Gestantes</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AnimalDeleteDialog
        animalId={deleteDialog.animalId}
        animalName={deleteDialog.animalName}
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, isOpen: open }))}
      />
    </div>
  );
};

export default AnimalList;

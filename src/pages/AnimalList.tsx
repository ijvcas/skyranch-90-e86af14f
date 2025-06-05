
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';

const AnimalList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    return `${years} años`;
  };

  const processedAnimals = animals.map(animal => ({
    id: animal.id,
    name: animal.name,
    species: animal.species === 'ovino' ? 'Ovino' : 
             animal.species === 'bovino' ? 'Bovino' :
             animal.species === 'equino' ? 'Equino' : 
             animal.species.charAt(0).toUpperCase() + animal.species.slice(1),
    breed: animal.breed,
    age: calculateAge(animal.birthDate),
    status: animal.healthStatus === 'healthy' ? 'Saludable' : 
            animal.healthStatus === 'sick' ? 'Enfermo' :
            animal.healthStatus === 'pregnant' ? 'Gestante' :
            animal.healthStatus === 'treatment' ? 'En Tratamiento' : 'Saludable',
    lastCheckup: '2024-05-15',
    weight: animal.weight ? `${animal.weight} kg` : 'N/A',
    image: animal.image
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Saludable':
        return 'bg-green-100 text-green-800';
      case 'En Tratamiento':
        return 'bg-red-100 text-red-800';
      case 'Gestante':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnimals = processedAnimals.filter(animal =>
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id.includes(searchTerm) ||
    animal.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando animales...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Panel
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gestión de Animales
              </h1>
              <p className="text-gray-600">Total: {animals.length} animales registrados</p>
            </div>
            <Button 
              onClick={() => navigate('/animals/new')}
              className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Animal
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar por nombre, ID o especie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAnimals.map((animal) => (
            <Card 
              key={animal.id} 
              className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => navigate(`/animals/${animal.id}`)}
            >
              <CardHeader className="pb-3">
                {animal.image && (
                  <div className="w-full h-32 mb-3 rounded-lg overflow-hidden">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {animal.name}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    #{animal.id}
                  </Badge>
                </div>
                <Badge className={`w-fit ${getStatusColor(animal.status)}`}>
                  {animal.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Especie:</span>
                    <span className="font-medium">{animal.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Raza:</span>
                    <span className="font-medium">{animal.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Edad:</span>
                    <span className="font-medium">{animal.age}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso:</span>
                    <span className="font-medium">{animal.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última Revisión:</span>
                    <span className="font-medium">{animal.lastCheckup}</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/animals/${animal.id}/edit`);
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnimals.length === 0 && (
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron animales
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza registrando tu primer animal'}
              </p>
              <Button 
                onClick={() => navigate('/animals/new')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Primer Animal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnimalList;

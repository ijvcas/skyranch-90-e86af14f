
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBreedingRecords } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';
import BreedingForm from '@/components/BreedingForm';
import BreedingRecordsList from '@/components/BreedingRecordsList';

const Breeding: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  const { data: breedingRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ['breeding-records'],
    queryFn: getBreedingRecords
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  // Create a map of animal IDs to names for display
  const animalNames = animals.reduce((acc, animal) => {
    acc[animal.id] = animal.name;
    return acc;
  }, {} as Record<string, string>);

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  if (isLoadingRecords) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold">Gestión de Apareamientos</h1>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Apareamiento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Apareamiento</DialogTitle>
            </DialogHeader>
            <BreedingForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Apareamientos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{breedingRecords.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Embarazos Confirmados</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breedingRecords.filter(record => record.pregnancyConfirmed).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partos Completados</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breedingRecords.filter(record => record.status === 'birth_completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Crías</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {breedingRecords.reduce((total, record) => total + (record.offspringCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breeding Records List */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Apareamiento</CardTitle>
        </CardHeader>
        <CardContent>
          <BreedingRecordsList 
            records={breedingRecords} 
            animalNames={animalNames}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Breeding;

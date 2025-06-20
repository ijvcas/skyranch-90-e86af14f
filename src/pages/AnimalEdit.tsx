
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnimal, updateAnimal } from '@/services/animalService';
import { checkPermission } from '@/services/permissionService';
import PermissionGuard from '@/components/PermissionGuard';
import BasicInformationForm from '@/components/animal-edit/BasicInformationForm';
import HealthStatusForm from '@/components/animal-edit/HealthStatusForm';
import PedigreeForm from '@/components/animal-edit/PedigreeForm';
import PhotoUploadForm from '@/components/animal-edit/PhotoUploadForm';
import NotesForm from '@/components/animal-edit/NotesForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const AnimalEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    gender: '',
    tag: '',
    birthDate: '',
    weight: '',
    color: '',
    healthStatus: 'healthy',
    notes: '',
    image: null as string | null,
    // Pedigree data
    motherId: '',
    fatherId: '',
    maternalGrandmotherId: '',
    maternalGrandfatherId: '',
    paternalGrandmotherId: '',
    paternalGrandfatherId: '',
    maternalGreatGrandmotherMaternalId: '',
    maternalGreatGrandfatherMaternalId: '',
    maternalGreatGrandmotherPaternalId: '',
    maternalGreatGrandfatherPaternalId: '',
    paternalGreatGrandmotherMaternalId: '',
    paternalGreatGrandfatherMaternalId: '',
    paternalGreatGrandmotherPaternalId: '',
    paternalGreatGrandfatherPaternalId: ''
  });

  const { data: animal, isLoading, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        species: animal.species || '',
        breed: animal.breed || '',
        gender: animal.gender || '',
        tag: animal.tag || '',
        birthDate: animal.birthDate || '',
        weight: animal.weight?.toString() || '',
        color: animal.color || '',
        healthStatus: animal.healthStatus || 'healthy',
        notes: animal.notes || '',
        image: animal.image || null,
        motherId: animal.motherId || '',
        fatherId: animal.fatherId || '',
        maternalGrandmotherId: animal.maternalGrandmotherId || '',
        maternalGrandfatherId: animal.maternalGrandfatherId || '',
        paternalGrandmotherId: animal.paternalGrandmotherId || '',
        paternalGrandfatherId: animal.paternalGrandfatherId || '',
        maternalGreatGrandmotherMaternalId: animal.maternalGreatGrandmotherMaternalId || '',
        maternalGreatGrandfatherMaternalId: animal.maternalGreatGrandfatherMaternalId || '',
        maternalGreatGrandmotherPaternalId: animal.maternalGreatGrandmotherPaternalId || '',
        maternalGreatGrandfatherPaternalId: animal.maternalGreatGrandfatherPaternalId || '',
        paternalGreatGrandmotherMaternalId: animal.paternalGreatGrandmotherMaternalId || '',
        paternalGreatGrandfatherMaternalId: animal.paternalGreatGrandfatherMaternalId || '',
        paternalGreatGrandmotherPaternalId: animal.paternalGreatGrandmotherPaternalId || '',
        paternalGreatGrandfatherPaternalId: animal.paternalGreatGrandfatherPaternalId || ''
      });
    }
  }, [animal]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔍 Checking animals_edit permission...');
      await checkPermission('animals_edit');
      console.log('✅ Permission granted for animal edit');
      
      return updateAnimal(id!, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
      toast({
        title: "Animal Actualizado",
        description: `${formData.name} ha sido actualizado exitosamente.`,
      });
      navigate(`/animals/${id}`);
    },
    onError: (error: any) => {
      console.error('❌ Error updating animal:', error);
      
      if (error.message?.includes('Acceso denegado')) {
        setPermissionError(error.message);
        toast({
          title: "Sin Permisos",
          description: "No tienes permisos para editar animales.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el animal.",
          variant: "destructive"
        });
      }
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPermissionError(null);
    
    if (!formData.name || !formData.species || !formData.tag) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre, especie y etiqueta.",
        variant: "destructive"
      });
      return;
    }

    console.log('🔄 Submitting animal edit form:', formData);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando animal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No se pudo cargar el animal.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/animals')} variant="outline">
              Volver a Animales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <Alert className="border-red-200 bg-red-50 max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {permissionError}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Button onClick={() => navigate('/animals')} variant="outline">
              Volver a Animales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="animals_edit">
      <div className="page-with-logo">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Editar Animal</h1>
              <p className="text-gray-500">Modifica la información de {animal.name}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate(`/animals/${id}`)}
            >
              Cancelar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <BasicInformationForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />
            
            <HealthStatusForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />
            
            <PedigreeForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />
            
            <PhotoUploadForm 
              formData={formData} 
              onImageChange={handleImageChange} 
            />

            <NotesForm 
              formData={formData} 
              onInputChange={handleInputChange} 
            />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Confirmar Cambios</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/animals/${id}`)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending || !formData.name || !formData.species || !formData.tag}
                >
                  {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Animal'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </PermissionGuard>
  );
};

export default AnimalEdit;

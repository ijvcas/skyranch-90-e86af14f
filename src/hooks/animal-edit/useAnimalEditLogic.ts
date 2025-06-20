
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAnimal, updateAnimal } from '@/services/animalService';
import { checkPermission } from '@/services/permissionService';

export const useAnimalEditLogic = () => {
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

  return {
    id,
    animal,
    isLoading,
    error,
    formData,
    permissionError,
    updateMutation,
    handleInputChange,
    handleImageChange,
    handleSubmit,
    navigate
  };
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnimal, updateAnimal, getAnimalByNameOrTag } from '@/services/animalService';

const AnimalEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    tag: '',
    species: '',
    breed: '',
    birthDate: '',
    gender: '',
    weight: '',
    color: '',
    motherId: '',
    fatherId: '',
    maternalGrandmotherId: '',
    maternalGrandfatherId: '',
    paternalGrandmotherId: '',
    paternalGrandfatherId: '',
    notes: '',
    healthStatus: 'healthy',
    image: null as string | null
  });

  // Fetch animal data
  const { data: animal, isLoading: isLoadingAnimal, error } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => getAnimal(id!),
    enabled: !!id
  });

  // Fetch parent data to get grandparent IDs
  const { data: mother } = useQuery({
    queryKey: ['mother', formData.motherId],
    queryFn: () => formData.motherId ? getAnimalByNameOrTag(formData.motherId) : null,
    enabled: !!formData.motherId && formData.motherId.trim() !== ''
  });

  const { data: father } = useQuery({
    queryKey: ['father', formData.fatherId],
    queryFn: () => formData.fatherId ? getAnimalByNameOrTag(formData.fatherId) : null,
    enabled: !!formData.fatherId && formData.fatherId.trim() !== ''
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateAnimal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animal', id] });
      toast({
        title: "Animal Actualizado",
        description: `${formData.name} ha sido actualizado exitosamente.`,
      });
      navigate('/animals');
    },
    onError: (error) => {
      console.error('Error updating animal:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el animal.",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (animal) {
      console.log('Loading animal data:', animal);
      
      setFormData({
        name: animal.name,
        tag: animal.tag,
        species: animal.species,
        breed: animal.breed,
        birthDate: animal.birthDate,
        gender: animal.gender,
        weight: animal.weight,
        color: animal.color,
        motherId: animal.motherId || '',
        fatherId: animal.fatherId || '',
        maternalGrandmotherId: '',
        maternalGrandfatherId: '',
        paternalGrandmotherId: '',
        paternalGrandfatherId: '',
        notes: animal.notes,
        healthStatus: animal.healthStatus,
        image: animal.image
      });
    }
  }, [animal]);

  // Update grandparent fields when parent data is loaded
  useEffect(() => {
    if (mother) {
      setFormData(prev => ({
        ...prev,
        maternalGrandmotherId: mother.motherId || '',
        maternalGrandfatherId: mother.fatherId || ''
      }));
    }
  }, [mother]);

  useEffect(() => {
    if (father) {
      setFormData(prev => ({
        ...prev,
        paternalGrandmotherId: father.motherId || '',
        paternalGrandfatherId: father.fatherId || ''
      }));
    }
  }, [father]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Animal no encontrado",
        description: "El animal que intentas editar no existe.",
        variant: "destructive"
      });
      navigate('/animals');
    }
  }, [error, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    console.log('Form data before submission:', formData);
    
    // Update parent animals with grandparent information if they exist
    if (formData.motherId && (formData.maternalGrandmotherId || formData.maternalGrandfatherId)) {
      const motherAnimal = await getAnimalByNameOrTag(formData.motherId);
      if (motherAnimal) {
        await updateAnimal(motherAnimal.id, {
          ...motherAnimal,
          motherId: formData.maternalGrandmotherId,
          fatherId: formData.maternalGrandfatherId
        });
      }
    }

    if (formData.fatherId && (formData.paternalGrandmotherId || formData.paternalGrandfatherId)) {
      const fatherAnimal = await getAnimalByNameOrTag(formData.fatherId);
      if (fatherAnimal) {
        await updateAnimal(fatherAnimal.id, {
          ...fatherAnimal,
          motherId: formData.paternalGrandmotherId,
          fatherId: formData.paternalGrandfatherId
        });
      }
    }
    
    // Prepare data for the main animal (excluding grandparent fields)
    const dataToSubmit = {
      name: formData.name,
      tag: formData.tag,
      species: formData.species,
      breed: formData.breed,
      birthDate: formData.birthDate,
      gender: formData.gender,
      weight: formData.weight,
      color: formData.color,
      motherId: formData.motherId.trim() || '',
      fatherId: formData.fatherId.trim() || '',
      notes: formData.notes,
      healthStatus: formData.healthStatus,
      image: formData.image,
      maternalGrandmotherId: formData.maternalGrandmotherId,
      maternalGrandfatherId: formData.maternalGrandfatherId,
      paternalGrandmotherId: formData.paternalGrandmotherId,
      paternalGrandfatherId: formData.paternalGrandfatherId,
    };
    
    console.log('Data being submitted:', dataToSubmit);
    
    updateMutation.mutate({ 
      id, 
      data: dataToSubmit 
    });
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating field ${field} with value:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  if (!id) {
    return null;
  }

  if (isLoadingAnimal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando animal...</div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Animal no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Animal: {formData.name}
          </h1>
          <p className="text-gray-600">Modifica la información del animal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="tag">Número de Etiqueta *</Label>
                  <Input
                    id="tag"
                    type="text"
                    value={formData.tag}
                    onChange={(e) => handleInputChange('tag', e.target.value)}
                    required
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Especie *</Label>
                  <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)} disabled={updateMutation.isPending}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar especie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bovino">Bovino</SelectItem>
                      <SelectItem value="ovino">Ovino</SelectItem>
                      <SelectItem value="caprino">Caprino</SelectItem>
                      <SelectItem value="porcino">Porcino</SelectItem>
                      <SelectItem value="equino">Equino</SelectItem>
                      <SelectItem value="aviar">Aviar</SelectItem>
                      <SelectItem value="canine">Canino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    type="text"
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)} disabled={updateMutation.isPending}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Seleccionar sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="macho">Macho</SelectItem>
                      <SelectItem value="hembra">Hembra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="mt-1"
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color">Color/Marcas</Label>
                <Input
                  id="color"
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="mt-1"
                  disabled={updateMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pedigree Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Información de Pedigrí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Parents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Padres</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="motherId">Madre</Label>
                    <Input
                      id="motherId"
                      type="text"
                      value={formData.motherId}
                      onChange={(e) => handleInputChange('motherId', e.target.value)}
                      placeholder="Nombre o etiqueta de la madre"
                      className="mt-1"
                      disabled={updateMutation.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe el nombre o número de etiqueta de la madre
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="fatherId">Padre</Label>
                    <Input
                      id="fatherId"
                      type="text"
                      value={formData.fatherId}
                      onChange={(e) => handleInputChange('fatherId', e.target.value)}
                      placeholder="Nombre o etiqueta del padre"
                      className="mt-1"
                      disabled={updateMutation.isPending}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe el nombre o número de etiqueta del padre
                    </p>
                  </div>
                </div>
              </div>

              {/* Grandparents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Abuelos</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Línea Materna</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maternalGrandmotherId">Abuela Materna</Label>
                        <Input
                          id="maternalGrandmotherId"
                          type="text"
                          value={formData.maternalGrandmotherId}
                          onChange={(e) => handleInputChange('maternalGrandmotherId', e.target.value)}
                          placeholder="Nombre o etiqueta de la abuela materna"
                          className="mt-1"
                          disabled={updateMutation.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maternalGrandfatherId">Abuelo Materno</Label>
                        <Input
                          id="maternalGrandfatherId"
                          type="text"
                          value={formData.maternalGrandfatherId}
                          onChange={(e) => handleInputChange('maternalGrandfatherId', e.target.value)}
                          placeholder="Nombre o etiqueta del abuelo materno"
                          className="mt-1"
                          disabled={updateMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-md font-medium text-gray-700 mb-2">Línea Paterna</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paternalGrandmotherId">Abuela Paterna</Label>
                        <Input
                          id="paternalGrandmotherId"
                          type="text"
                          value={formData.paternalGrandmotherId}
                          onChange={(e) => handleInputChange('paternalGrandmotherId', e.target.value)}
                          placeholder="Nombre o etiqueta de la abuela paterna"
                          className="mt-1"
                          disabled={updateMutation.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="paternalGrandfatherId">Abuelo Paterno</Label>
                        <Input
                          id="paternalGrandfatherId"
                          type="text"
                          value={formData.paternalGrandfatherId}
                          onChange={(e) => handleInputChange('paternalGrandfatherId', e.target.value)}
                          placeholder="Nombre o etiqueta del abuelo paterno"
                          className="mt-1"
                          disabled={updateMutation.isPending}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Status */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Estado de Salud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="healthStatus">Estado Actual</Label>
                <Select value={formData.healthStatus} onValueChange={(value) => handleInputChange('healthStatus', value)} disabled={updateMutation.isPending}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Saludable</SelectItem>
                    <SelectItem value="sick">Enfermo</SelectItem>
                    <SelectItem value="pregnant">Gestante</SelectItem>
                    <SelectItem value="treatment">En Tratamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Fotografía</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                currentImage={formData.image}
                onImageChange={handleImageChange}
                disabled={updateMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Notas Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Cualquier información adicional sobre el animal..."
                rows={4}
                disabled={updateMutation.isPending}
              />
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimalEdit;

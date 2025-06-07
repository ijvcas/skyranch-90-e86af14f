import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ImageUpload from '@/components/ImageUpload';
import { addAnimal } from '@/services/animalService';

const AnimalForm = () => {
  const navigate = useNavigate();
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

  const addAnimalMutation = useMutation({
    mutationFn: addAnimal,
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['animals'] });
      queryClient.invalidateQueries({ queryKey: ['animalCounts'] });
      toast({
        title: "Animal Registrado",
        description: `${formData.name} ha sido registrado exitosamente.`,
      });
      navigate('/animals');
    },
    onError: (error) => {
      console.error('Error adding animal:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al guardar el animal. Intente nuevamente.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.tag || !formData.species) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos (Nombre, Etiqueta, Especie).",
        variant: "destructive"
      });
      return;
    }

    addAnimalMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageUrl: string | null) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/animals')}
            className="mb-4"
          >
            ← Volver a Animales
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Nuevo Animal
          </h1>
          <p className="text-gray-600">Complete la información del animal</p>
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
                    placeholder="Ej: Bella"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tag">Número de Etiqueta *</Label>
                  <Input
                    id="tag"
                    type="text"
                    value={formData.tag}
                    onChange={(e) => handleInputChange('tag', e.target.value)}
                    placeholder="Ej: 001"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Especie *</Label>
                  <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)}>
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
                      <SelectItem value="caninos">Caninos</SelectItem>
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
                    placeholder="Ej: Holstein"
                    className="mt-1"
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
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                    placeholder="Ej: 450"
                    className="mt-1"
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
                  placeholder="Ej: Negro con manchas blancas"
                  className="mt-1"
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
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe cualquier nombre, no necesita estar registrado
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
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe cualquier nombre, no necesita estar registrado
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
                        />
                        <p className="text-xs text-gray-500 mt-1">Opcional</p>
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
                        />
                        <p className="text-xs text-gray-500 mt-1">Opcional</p>
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
                        />
                        <p className="text-xs text-gray-500 mt-1">Opcional</p>
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
                        />
                        <p className="text-xs text-gray-500 mt-1">Opcional</p>
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
                <Select value={formData.healthStatus} onValueChange={(value) => handleInputChange('healthStatus', value)}>
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
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/animals')}
              className="flex-1"
              disabled={addAnimalMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={addAnimalMutation.isPending}
            >
              {addAnimalMutation.isPending ? 'Guardando...' : 'Registrar Animal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnimalForm;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, Save, ArrowLeft } from 'lucide-react';

const AnimalEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
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
    notes: '',
    healthStatus: 'healthy'
  });

  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app this would come from API
  const mockAnimals = {
    '001': {
      name: 'Dolly',
      tag: '001',
      species: 'ovino',
      breed: 'Merino',
      birthDate: '2022-03-15',
      gender: 'hembra',
      weight: '65',
      color: 'Blanco',
      motherId: '',
      fatherId: '',
      notes: 'Animal muy dócil y saludable',
      healthStatus: 'healthy'
    },
    '002': {
      name: 'Woolly',
      tag: '002',
      species: 'ovino',
      breed: 'Romney',
      birthDate: '2021-05-20',
      gender: 'macho',
      weight: '70',
      color: 'Gris',
      motherId: '',
      fatherId: '',
      notes: 'Buen reproductor',
      healthStatus: 'healthy'
    },
    '003': {
      name: 'Burrito',
      tag: '003',
      species: 'equino',
      breed: 'Andaluz',
      birthDate: '2019-08-10',
      gender: 'macho',
      weight: '180',
      color: 'Marrón',
      motherId: '',
      fatherId: '',
      notes: 'Animal de trabajo',
      healthStatus: 'healthy'
    },
    '004': {
      name: 'Bessie',
      tag: '004',
      species: 'bovino',
      breed: 'Holstein',
      birthDate: '2020-11-05',
      gender: 'hembra',
      weight: '520',
      color: 'Negro con manchas blancas',
      motherId: '',
      fatherId: '',
      notes: 'Excelente productora de leche',
      healthStatus: 'healthy'
    }
  };

  useEffect(() => {
    // Load animal data
    if (id && mockAnimals[id as keyof typeof mockAnimals]) {
      setFormData(mockAnimals[id as keyof typeof mockAnimals]);
    } else {
      toast({
        title: "Animal no encontrado",
        description: "El animal que intentas editar no existe.",
        variant: "destructive"
      });
      navigate('/animals');
    }
  }, [id, navigate, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Updated animal data:', formData);
      
      toast({
        title: "Animal Actualizado",
        description: `${formData.name} ha sido actualizado exitosamente.`,
      });
      
      setIsLoading(false);
      navigate('/animals');
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!id) {
    return null;
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Especie *</Label>
                  <Select value={formData.species} onValueChange={(value) => handleInputChange('species', value)} disabled={isLoading}>
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Sexo</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)} disabled={isLoading}>
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
                    disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pedigree Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Información de Pedigrí</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motherId">ID de la Madre</Label>
                  <Input
                    id="motherId"
                    type="text"
                    value={formData.motherId}
                    onChange={(e) => handleInputChange('motherId', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="fatherId">ID del Padre</Label>
                  <Input
                    id="fatherId"
                    type="text"
                    value={formData.fatherId}
                    onChange={(e) => handleInputChange('fatherId', e.target.value)}
                    className="mt-1"
                    disabled={isLoading}
                  />
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
                <Select value={formData.healthStatus} onValueChange={(value) => handleInputChange('healthStatus', value)} disabled={isLoading}>
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Toca para cambiar la foto del animal</p>
                <Button type="button" variant="outline" disabled={isLoading}>
                  <Camera className="w-4 h-4 mr-2" />
                  Cambiar Foto
                </Button>
              </div>
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
                disabled={isLoading}
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
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
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


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBreedingRecord } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';

interface BreedingFormProps {
  onSuccess: () => void;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motherId: '',
    fatherId: '',
    breedingDate: '',
    breedingMethod: 'natural' as const,
    expectedDueDate: '',
    pregnancyConfirmed: false,
    pregnancyConfirmationDate: '',
    pregnancyMethod: '',
    offspringCount: 0,
    breedingNotes: '',
    veterinarian: '',
    cost: '',
    status: 'planned' as const
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const createMutation = useMutation({
    mutationFn: createBreedingRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      toast({
        title: "Registro Creado",
        description: "El registro de apareamiento ha sido creado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating breeding record:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de apareamiento.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.motherId || !formData.fatherId || !formData.breedingDate) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos (Madre, Padre, Fecha de Apareamiento).",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      motherId: formData.motherId,
      fatherId: formData.fatherId,
      breedingDate: formData.breedingDate,
      breedingMethod: formData.breedingMethod,
      expectedDueDate: formData.expectedDueDate || undefined,
      pregnancyConfirmed: formData.pregnancyConfirmed,
      pregnancyConfirmationDate: formData.pregnancyConfirmationDate || undefined,
      pregnancyMethod: formData.pregnancyMethod || undefined,
      offspringCount: formData.offspringCount,
      breedingNotes: formData.breedingNotes || undefined,
      veterinarian: formData.veterinarian || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      status: formData.status
    };

    createMutation.mutate(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Apareamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="motherId">Madre *</Label>
              <Select value={formData.motherId} onValueChange={(value) => handleInputChange('motherId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar madre" />
                </SelectTrigger>
                <SelectContent>
                  {animals.filter(animal => animal.gender === 'hembra').map(animal => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} (#{animal.tag})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="fatherId">Padre *</Label>
              <Select value={formData.fatherId} onValueChange={(value) => handleInputChange('fatherId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar padre" />
                </SelectTrigger>
                <SelectContent>
                  {animals.filter(animal => animal.gender === 'macho').map(animal => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} (#{animal.tag})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="breedingDate">Fecha de Apareamiento *</Label>
              <Input
                id="breedingDate"
                type="date"
                value={formData.breedingDate}
                onChange={(e) => handleInputChange('breedingDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="breedingMethod">Método de Apareamiento</Label>
              <Select value={formData.breedingMethod} onValueChange={(value) => handleInputChange('breedingMethod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                  <SelectItem value="embryo_transfer">Transferencia de Embriones</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
              <Input
                id="expectedDueDate"
                type="date"
                value={formData.expectedDueDate}
                onChange={(e) => handleInputChange('expectedDueDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planeado</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="confirmed_pregnant">Embarazo Confirmado</SelectItem>
                  <SelectItem value="not_pregnant">No Embarazada</SelectItem>
                  <SelectItem value="birth_completed">Parto Completado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del Embarazo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.pregnancyConfirmed}
              onCheckedChange={(checked) => handleInputChange('pregnancyConfirmed', checked)}
            />
            <Label>Embarazo Confirmado</Label>
          </div>

          {formData.pregnancyConfirmed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pregnancyConfirmationDate">Fecha de Confirmación</Label>
                <Input
                  id="pregnancyConfirmationDate"
                  type="date"
                  value={formData.pregnancyConfirmationDate}
                  onChange={(e) => handleInputChange('pregnancyConfirmationDate', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pregnancyMethod">Método de Confirmación</Label>
                <Select value={formData.pregnancyMethod} onValueChange={(value) => handleInputChange('pregnancyMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="ultrasound">Ultrasonido</SelectItem>
                    <SelectItem value="blood_test">Análisis de Sangre</SelectItem>
                    <SelectItem value="palpation">Palpación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="offspringCount">Número de Crías</Label>
            <Input
              id="offspringCount"
              type="number"
              min="0"
              value={formData.offspringCount}
              onChange={(e) => handleInputChange('offspringCount', parseInt(e.target.value) || 0)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => handleInputChange('veterinarian', e.target.value)}
                placeholder="Nombre del veterinario"
              />
            </div>
            <div>
              <Label htmlFor="cost">Costo ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="breedingNotes">Notas</Label>
            <Textarea
              id="breedingNotes"
              value={formData.breedingNotes}
              onChange={(e) => handleInputChange('breedingNotes', e.target.value)}
              placeholder="Notas adicionales sobre el apareamiento..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Guardando...' : 'Crear Registro'}
        </Button>
      </div>
    </form>
  );
};

export default BreedingForm;

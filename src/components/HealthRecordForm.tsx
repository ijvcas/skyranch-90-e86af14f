
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addHealthRecord } from '@/services/healthRecordService';
import { getAllAnimals } from '@/services/animalService';

interface HealthRecordFormProps {
  onSuccess: () => void;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    animalId: '',
    recordType: 'vaccination' as const,
    title: '',
    description: '',
    veterinarian: '',
    medication: '',
    dosage: '',
    cost: '',
    dateAdministered: '',
    nextDueDate: '',
    notes: ''
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const createMutation = useMutation({
    mutationFn: addHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-health-records'] });
      toast({
        title: "Registro Creado",
        description: "El registro de salud ha sido creado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating health record:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de salud.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalId || !formData.title || !formData.dateAdministered) {
      toast({
        title: "Error",
        description: "Por favor complete los campos requeridos (Animal, Título, Fecha).",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      animalId: formData.animalId,
      recordType: formData.recordType,
      title: formData.title,
      description: formData.description || undefined,
      veterinarian: formData.veterinarian || undefined,
      medication: formData.medication || undefined,
      dosage: formData.dosage || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      dateAdministered: formData.dateAdministered,
      nextDueDate: formData.nextDueDate || undefined,
      notes: formData.notes || undefined
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
          <CardTitle>Información Básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="animalId">Animal *</Label>
              <Select value={formData.animalId} onValueChange={(value) => handleInputChange('animalId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map(animal => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} (#{animal.tag})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="recordType">Tipo de Registro</Label>
              <Select value={formData.recordType} onValueChange={(value) => handleInputChange('recordType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vacunación</SelectItem>
                  <SelectItem value="treatment">Tratamiento</SelectItem>
                  <SelectItem value="checkup">Revisión</SelectItem>
                  <SelectItem value="illness">Enfermedad</SelectItem>
                  <SelectItem value="injury">Lesión</SelectItem>
                  <SelectItem value="medication">Medicación</SelectItem>
                  <SelectItem value="surgery">Cirugía</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Vacuna contra rabia"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descripción detallada del procedimiento..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles del Tratamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="medication">Medicamento</Label>
              <Input
                id="medication"
                value={formData.medication}
                onChange={(e) => handleInputChange('medication', e.target.value)}
                placeholder="Nombre del medicamento"
              />
            </div>
            <div>
              <Label htmlFor="dosage">Dosis</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => handleInputChange('dosage', e.target.value)}
                placeholder="Ej: 5ml, 2 pastillas"
              />
            </div>
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateAdministered">Fecha de Administración *</Label>
              <Input
                id="dateAdministered"
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => handleInputChange('dateAdministered', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="nextDueDate">Próxima Fecha Requerida</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={formData.nextDueDate}
                onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Notas adicionales sobre el tratamiento..."
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

export default HealthRecordForm;

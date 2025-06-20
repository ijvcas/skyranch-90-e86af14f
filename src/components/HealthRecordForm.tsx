
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, DollarSign, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addHealthRecord } from '@/services/healthRecordService';
import { getAllAnimals } from '@/services/animalService';

interface HealthRecordFormProps {
  onSuccess?: () => void;
  preSelectedAnimalId?: string;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ onSuccess, preSelectedAnimalId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || '',
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

  const addMutation = useMutation({
    mutationFn: addHealthRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      if (preSelectedAnimalId) {
        queryClient.invalidateQueries({ queryKey: ['health-records', preSelectedAnimalId] });
      }
      toast({
        title: "Registro Creado",
        description: "El registro de salud ha sido creado exitosamente.",
      });
      onSuccess?.();
      resetForm();
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

  const resetForm = () => {
    setFormData({
      animalId: preSelectedAnimalId || '',
      recordType: 'vaccination',
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
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalId || !formData.title || !formData.dateAdministered) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa animal, título y fecha.",
        variant: "destructive"
      });
      return;
    }

    const recordData = {
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

    addMutation.mutate(recordData);
  };

  const recordTypeOptions = [
    { value: 'vaccination', label: 'Vacunación' },
    { value: 'treatment', label: 'Tratamiento' },
    { value: 'checkup', label: 'Revisión' },
    { value: 'illness', label: 'Enfermedad' },
    { value: 'injury', label: 'Lesión' },
    { value: 'medication', label: 'Medicación' },
    { value: 'surgery', label: 'Cirugía' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-green-500" />
          <span>Nuevo Registro de Salud</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animal Selection - hide if pre-selected */}
            {!preSelectedAnimalId && (
              <div className="md:col-span-2">
                <Label htmlFor="animalId">Animal *</Label>
                <Select value={formData.animalId} onValueChange={(value) => handleInputChange('animalId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animals.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.name} (#{animal.tag})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="recordType">Tipo de Registro *</Label>
              <Select value={formData.recordType} onValueChange={(value) => handleInputChange('recordType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recordTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Vacuna antirrábica"
              />
            </div>

            <div>
              <Label htmlFor="dateAdministered">Fecha Administrada *</Label>
              <div className="relative">
                <Input
                  id="dateAdministered"
                  type="date"
                  value={formData.dateAdministered}
                  onChange={(e) => handleInputChange('dateAdministered', e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="nextDueDate">Próximo Vencimiento</Label>
              <div className="relative">
                <Input
                  id="nextDueDate"
                  type="date"
                  value={formData.nextDueDate}
                  onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

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
                placeholder="Ej: 2ml cada 12 horas"
              />
            </div>

            <div>
              <Label htmlFor="cost">Costo</Label>
              <div className="relative">
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  placeholder="0.00"
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe el procedimiento o tratamiento..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Cualquier observación adicional..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
            >
              Limpiar
            </Button>
            <Button 
              type="submit" 
              disabled={addMutation.isPending || !formData.animalId || !formData.title || !formData.dateAdministered}
            >
              {addMutation.isPending ? 'Creando...' : 'Crear Registro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthRecordForm;

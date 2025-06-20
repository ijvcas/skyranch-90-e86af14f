
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateHealthRecord } from '@/services/healthRecordService';
import { useToast } from '@/hooks/use-toast';

interface HealthRecord {
  id: string;
  animalId: string;
  recordType: string;
  title: string;
  description?: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  dateAdministered: string;
  nextDueDate?: string;
  notes?: string;
}

interface HealthRecordEditFormProps {
  record: HealthRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

const HealthRecordEditForm: React.FC<HealthRecordEditFormProps> = ({
  record,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    recordType: record.recordType,
    title: record.title,
    description: record.description || '',
    veterinarian: record.veterinarian || '',
    medication: record.medication || '',
    dosage: record.dosage || '',
    cost: record.cost?.toString() || '',
    dateAdministered: record.dateAdministered,
    nextDueDate: record.nextDueDate || '',
    notes: record.notes || ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateHealthRecord(record.id, {
      recordType: data.recordType as any,
      title: data.title,
      description: data.description || undefined,
      veterinarian: data.veterinarian || undefined,
      medication: data.medication || undefined,
      dosage: data.dosage || undefined,
      cost: data.cost ? parseFloat(data.cost) : undefined,
      dateAdministered: data.dateAdministered,
      nextDueDate: data.nextDueDate || undefined,
      notes: data.notes || undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records'] });
      queryClient.invalidateQueries({ queryKey: ['all-health-records'] });
      toast({
        title: "Registro actualizado",
        description: "El registro de salud ha sido actualizado exitosamente.",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de salud.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.recordType || !formData.dateAdministered) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive"
      });
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
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
              <Label htmlFor="recordType">Tipo de Registro *</Label>
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
                  <SelectItem value="medication">Medicamento</SelectItem>
                  <SelectItem value="surgery">Cirugía</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateAdministered">Fecha *</Label>
              <Input
                id="dateAdministered"
                type="date"
                value={formData.dateAdministered}
                onChange={(e) => handleInputChange('dateAdministered', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ej: Vacuna antirrábica, Desparasitación, etc."
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
          <CardTitle>Detalles Médicos</CardTitle>
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
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

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
                placeholder="Ej: 5 ML, 2 tabletas, etc."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="nextDueDate">Próximo Vencimiento</Label>
            <Input
              id="nextDueDate"
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => handleInputChange('nextDueDate', e.target.value)}
            />
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

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Registro'}
        </Button>
      </div>
    </form>
  );
};

export default HealthRecordEditForm;

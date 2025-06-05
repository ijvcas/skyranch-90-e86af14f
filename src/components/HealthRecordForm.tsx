
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addHealthRecord, HealthRecord } from '@/services/healthRecordService';
import { useToast } from '@/hooks/use-toast';

interface HealthRecordFormProps {
  animalId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ animalId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    recordType: '' as HealthRecord['recordType'] | '',
    title: '',
    description: '',
    veterinarian: '',
    medication: '',
    dosage: '',
    cost: '',
    dateAdministered: undefined as Date | undefined,
    nextDueDate: undefined as Date | undefined,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const recordTypes = [
    { value: 'vaccination', label: 'Vacunación' },
    { value: 'treatment', label: 'Tratamiento' },
    { value: 'checkup', label: 'Revisión' },
    { value: 'illness', label: 'Enfermedad' },
    { value: 'injury', label: 'Lesión' },
    { value: 'medication', label: 'Medicación' },
    { value: 'surgery', label: 'Cirugía' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.recordType || !formData.title || !formData.dateAdministered) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await addHealthRecord({
        animalId,
        recordType: formData.recordType,
        title: formData.title,
        description: formData.description || undefined,
        veterinarian: formData.veterinarian || undefined,
        medication: formData.medication || undefined,
        dosage: formData.dosage || undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        dateAdministered: formData.dateAdministered.toISOString().split('T')[0],
        nextDueDate: formData.nextDueDate ? formData.nextDueDate.toISOString().split('T')[0] : undefined,
        notes: formData.notes || undefined
      });

      if (success) {
        toast({
          title: "Éxito",
          description: "Registro de salud agregado correctamente"
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Error",
          description: "No se pudo agregar el registro de salud",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding health record:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al agregar el registro",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Nuevo Registro de Salud</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Tipo de Registro *</Label>
              <Select value={formData.recordType} onValueChange={(value) => setFormData(prev => ({ ...prev, recordType: value as HealthRecord['recordType'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {recordTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Vacuna contra rabia"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Administración *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateAdministered && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateAdministered ? format(formData.dateAdministered, "PPP") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dateAdministered}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateAdministered: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Próxima Fecha de Vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.nextDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.nextDueDate ? format(formData.nextDueDate, "PPP") : "Selecciona una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.nextDueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, nextDueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input
                id="veterinarian"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Nombre del veterinario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medication">Medicamento</Label>
              <Input
                id="medication"
                value={formData.medication}
                onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                placeholder="Nombre del medicamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis</Label>
              <Input
                id="dosage"
                value={formData.dosage}
                onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                placeholder="Ej: 5ml, 2 tabletas"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del procedimiento o tratamiento"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionales"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthRecordForm;


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { addHealthRecord, HealthRecord } from '@/services/healthRecordService';
import { getAllAnimals } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';

const healthRecordSchema = z.object({
  animalId: z.string().min(1, 'Selecciona un animal'),
  recordType: z.enum(['vaccination', 'treatment', 'checkup', 'illness', 'injury', 'medication', 'surgery']),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  veterinarian: z.string().optional(),
  medication: z.string().optional(),
  dosage: z.string().optional(),
  cost: z.number().min(0).optional(),
  dateAdministered: z.date({ required_error: 'Selecciona la fecha' }),
  nextDueDate: z.date().optional(),
  notes: z.string().optional()
});

type HealthRecordFormData = z.infer<typeof healthRecordSchema>;

interface HealthRecordFormProps {
  onSuccess?: () => void;
  animalId?: string;
  initialData?: Partial<HealthRecord>;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({ onSuccess, animalId, initialData }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateAdministeredOpen, setDateAdministeredOpen] = useState(false);
  const [nextDueDateOpen, setNextDueDateOpen] = useState(false);

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<HealthRecordFormData>({
    resolver: zodResolver(healthRecordSchema),
    defaultValues: {
      animalId: animalId || initialData?.animalId,
      recordType: initialData?.recordType,
      title: initialData?.title,
      description: initialData?.description,
      veterinarian: initialData?.veterinarian,
      medication: initialData?.medication,
      dosage: initialData?.dosage,
      cost: initialData?.cost,
      dateAdministered: initialData?.dateAdministered ? new Date(initialData.dateAdministered) : undefined,
      nextDueDate: initialData?.nextDueDate ? new Date(initialData.nextDueDate) : undefined,
      notes: initialData?.notes
    }
  });

  const dateAdministered = watch('dateAdministered');
  const nextDueDate = watch('nextDueDate');

  const createMutation = useMutation({
    mutationFn: addHealthRecord,
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Registro de salud creado",
          description: "El registro se ha guardado exitosamente.",
        });
        queryClient.invalidateQueries({ queryKey: ['health-records'] });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el registro de salud.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: HealthRecordFormData) => {
    const recordData = {
      ...data,
      dateAdministered: data.dateAdministered.toISOString().split('T')[0],
      nextDueDate: data.nextDueDate?.toISOString().split('T')[0]
    };
    createMutation.mutate(recordData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Registro de Salud</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!animalId && (
            <div className="space-y-2">
              <Label htmlFor="animalId">Animal *</Label>
              <Select onValueChange={(value) => setValue('animalId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un animal" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - #{animal.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.animalId && <p className="text-sm text-red-600">{errors.animalId.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Tipo de Registro *</Label>
              <Select onValueChange={(value) => setValue('recordType', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
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
              {errors.recordType && <p className="text-sm text-red-600">{errors.recordType.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ej: Vacuna antirrábica"
              />
              {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción detallada del procedimiento..."
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Administración *</Label>
              <Popover open={dateAdministeredOpen} onOpenChange={setDateAdministeredOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateAdministered && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateAdministered ? format(dateAdministered, "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateAdministered}
                    onSelect={(date) => {
                      setValue('dateAdministered', date!);
                      setDateAdministeredOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateAdministered && <p className="text-sm text-red-600">{errors.dateAdministered.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Próximo Vencimiento</Label>
              <Popover open={nextDueDateOpen} onOpenChange={setNextDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextDueDate ? format(nextDueDate, "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={nextDueDate}
                    onSelect={(date) => {
                      setValue('nextDueDate', date);
                      setNextDueDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Medicamento</Label>
              <Input
                id="medication"
                {...register('medication')}
                placeholder="Nombre del medicamento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosis</Label>
              <Input
                id="dosage"
                {...register('dosage')}
                placeholder="Ej: 5ml cada 12 horas"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinario</Label>
              <Input
                id="veterinarian"
                {...register('veterinarian')}
                placeholder="Nombre del veterinario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                {...register('cost', { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notas adicionales..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthRecordForm;

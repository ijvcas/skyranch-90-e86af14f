
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
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createBreedingRecord, BreedingRecord } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';

const breedingSchema = z.object({
  motherId: z.string().min(1, 'Selecciona una madre'),
  fatherId: z.string().min(1, 'Selecciona un padre'),
  breedingDate: z.date({ required_error: 'Selecciona la fecha de apareamiento' }),
  breedingMethod: z.enum(['natural', 'artificial_insemination', 'embryo_transfer']),
  expectedDueDate: z.date().optional(),
  pregnancyConfirmed: z.boolean().default(false),
  pregnancyConfirmationDate: z.date().optional(),
  pregnancyMethod: z.enum(['visual', 'ultrasound', 'blood_test', 'palpation']).optional(),
  offspringCount: z.number().int().min(0).default(0),
  breedingNotes: z.string().optional(),
  veterinarian: z.string().optional(),
  cost: z.number().min(0).optional(),
  status: z.enum(['planned', 'completed', 'confirmed_pregnant', 'not_pregnant', 'birth_completed', 'failed']).default('planned')
});

type BreedingFormData = z.infer<typeof breedingSchema>;

interface BreedingFormProps {
  onSuccess?: () => void;
  initialData?: Partial<BreedingRecord>;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ onSuccess, initialData }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [breedingDateOpen, setBreedingDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [confirmationDateOpen, setConfirmationDateOpen] = useState(false);

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
  } = useForm<BreedingFormData>({
    resolver: zodResolver(breedingSchema),
    defaultValues: initialData ? {
      motherId: initialData.motherId,
      fatherId: initialData.fatherId,
      breedingDate: initialData.breedingDate ? new Date(initialData.breedingDate) : undefined,
      breedingMethod: initialData.breedingMethod,
      expectedDueDate: initialData.expectedDueDate ? new Date(initialData.expectedDueDate) : undefined,
      pregnancyConfirmed: initialData.pregnancyConfirmed,
      pregnancyConfirmationDate: initialData.pregnancyConfirmationDate ? new Date(initialData.pregnancyConfirmationDate) : undefined,
      pregnancyMethod: initialData.pregnancyMethod,
      offspringCount: initialData.offspringCount,
      breedingNotes: initialData.breedingNotes,
      veterinarian: initialData.veterinarian,
      cost: initialData.cost,
      status: initialData.status
    } : {}
  });

  const breedingDate = watch('breedingDate');
  const expectedDueDate = watch('expectedDueDate');
  const confirmationDate = watch('pregnancyConfirmationDate');
  const pregnancyConfirmed = watch('pregnancyConfirmed');

  const femaleAnimals = animals.filter(animal => animal.gender === 'hembra');
  const maleAnimals = animals.filter(animal => animal.gender === 'macho');

  const createMutation = useMutation({
    mutationFn: createBreedingRecord,
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Registro de apareamiento creado",
          description: "El registro se ha guardado exitosamente.",
        });
        queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
        onSuccess?.();
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el registro de apareamiento.",
          variant: "destructive",
        });
      }
    }
  });

  const onSubmit = (data: BreedingFormData) => {
    const recordData = {
      ...data,
      breedingDate: data.breedingDate.toISOString().split('T')[0],
      expectedDueDate: data.expectedDueDate?.toISOString().split('T')[0],
      pregnancyConfirmationDate: data.pregnancyConfirmationDate?.toISOString().split('T')[0],
      offspringCount: data.offspringCount || 0
    };
    createMutation.mutate(recordData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Registro de Apareamiento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="motherId">Madre *</Label>
              <Select onValueChange={(value) => setValue('motherId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la madre" />
                </SelectTrigger>
                <SelectContent>
                  {femaleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - #{animal.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.motherId && <p className="text-sm text-red-600">{errors.motherId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fatherId">Padre *</Label>
              <Select onValueChange={(value) => setValue('fatherId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el padre" />
                </SelectTrigger>
                <SelectContent>
                  {maleAnimals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} - #{animal.tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.fatherId && <p className="text-sm text-red-600">{errors.fatherId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Apareamiento *</Label>
              <Popover open={breedingDateOpen} onOpenChange={setBreedingDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !breedingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {breedingDate ? format(breedingDate, "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={breedingDate}
                    onSelect={(date) => {
                      setValue('breedingDate', date!);
                      setBreedingDateOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.breedingDate && <p className="text-sm text-red-600">{errors.breedingDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breedingMethod">Método de Apareamiento *</Label>
              <Select onValueChange={(value) => setValue('breedingMethod', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                  <SelectItem value="embryo_transfer">Transferencia de Embriones</SelectItem>
                </SelectContent>
              </Select>
              {errors.breedingMethod && <p className="text-sm text-red-600">{errors.breedingMethod.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha Esperada de Parto</Label>
              <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expectedDueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expectedDueDate ? format(expectedDueDate, "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={expectedDueDate}
                    onSelect={(date) => {
                      setValue('expectedDueDate', date);
                      setDueDateOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado *</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pregnancyConfirmed"
              checked={pregnancyConfirmed}
              onCheckedChange={(checked) => setValue('pregnancyConfirmed', !!checked)}
            />
            <Label htmlFor="pregnancyConfirmed">Embarazo confirmado</Label>
          </div>

          {pregnancyConfirmed && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Confirmación</Label>
                <Popover open={confirmationDateOpen} onOpenChange={setConfirmationDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !confirmationDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {confirmationDate ? format(confirmationDate, "dd/MM/yyyy", { locale: es }) : "Selecciona fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={confirmationDate}
                      onSelect={(date) => {
                        setValue('pregnancyConfirmationDate', date);
                        setConfirmationDateOpen(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pregnancyMethod">Método de Confirmación</Label>
                <Select onValueChange={(value) => setValue('pregnancyMethod', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual</SelectItem>
                    <SelectItem value="ultrasound">Ultrasonido</SelectItem>
                    <SelectItem value="blood_test">Examen de Sangre</SelectItem>
                    <SelectItem value="palpation">Palpación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offspringCount">Número de Crías</Label>
              <Input
                id="offspringCount"
                type="number"
                min="0"
                {...register('offspringCount', { valueAsNumber: true })}
              />
            </div>

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
            <Label htmlFor="breedingNotes">Notas</Label>
            <Textarea
              id="breedingNotes"
              {...register('breedingNotes')}
              placeholder="Notas adicionales sobre el apareamiento..."
              className="min-h-[100px]"
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

export default BreedingForm;


import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createBreedingRecord } from '@/services/breedingService';
import { getAnimals } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const breedingFormSchema = z.object({
  motherId: z.string().min(1, "Madre es requerida"),
  fatherId: z.string().min(1, "Padre es requerido"),
  breedingDate: z.date({
    required_error: "Fecha de cruza es requerida",
  }),
  breedingMethod: z.enum(['natural', 'artificial_insemination', 'embryo_transfer']),
  expectedDueDate: z.date().optional(),
  pregnancyConfirmed: z.boolean().default(false),
  pregnancyConfirmationDate: z.date().optional(),
  pregnancyMethod: z.enum(['visual', 'ultrasound', 'blood_test', 'palpation']).optional(),
  gestationLength: z.number().optional(),
  breedingNotes: z.string().optional(),
  veterinarian: z.string().optional(),
  cost: z.number().optional(),
  status: z.enum(['planned', 'completed', 'confirmed_pregnant', 'not_pregnant', 'birth_completed', 'failed']).default('planned'),
});

type BreedingFormData = z.infer<typeof breedingFormSchema>;

interface BreedingFormProps {
  onSuccess?: () => void;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BreedingFormData>({
    resolver: zodResolver(breedingFormSchema),
    defaultValues: {
      breedingMethod: 'natural',
      pregnancyConfirmed: false,
      status: 'planned',
    },
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAnimals,
  });

  const createMutation = useMutation({
    mutationFn: createBreedingRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      toast({
        title: "Éxito",
        description: "Registro de cruza creado exitosamente",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      console.error('Error creating breeding record:', error);
      toast({
        title: "Error",
        description: "Error al crear el registro de cruza",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BreedingFormData) => {
    console.log('Form data:', data);
    
    const breedingData = {
      motherId: data.motherId,
      fatherId: data.fatherId,
      breedingDate: data.breedingDate.toISOString().split('T')[0],
      breedingMethod: data.breedingMethod,
      expectedDueDate: data.expectedDueDate?.toISOString().split('T')[0],
      pregnancyConfirmed: data.pregnancyConfirmed,
      pregnancyConfirmationDate: data.pregnancyConfirmationDate?.toISOString().split('T')[0],
      pregnancyMethod: data.pregnancyMethod,
      gestationLength: data.gestationLength || 0,
      breedingNotes: data.breedingNotes || '',
      veterinarian: data.veterinarian || '',
      cost: data.cost || 0,
      status: data.status,
    };

    createMutation.mutate(breedingData);
  };

  const femaleAnimals = animals.filter(animal => animal.gender === 'hembra');
  const maleAnimals = animals.filter(animal => animal.gender === 'macho');

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Nuevo Registro de Cruza</CardTitle>
        <CardDescription>Registra una nueva actividad de reproducción</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="motherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Madre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar madre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {femaleAnimals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name} - {animal.tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fatherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Padre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar padre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {maleAnimals.map((animal) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name} - {animal.tag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="breedingDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Cruza</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="breedingMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Cruza</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar método" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                        <SelectItem value="embryo_transfer">Transferencia de Embriones</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="expectedDueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha Estimada de Parto (Opcional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="veterinarian"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinario (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del veterinario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo (Opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="breedingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre la cruza..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Guardando...' : 'Registrar Cruza'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BreedingForm;

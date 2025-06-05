
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { getAllAnimals, Animal } from '@/services/animalService';
import { addBreedingRecord, updateBreedingRecord, BreedingRecord } from '@/services/breedingService';

const breedingSchema = z.object({
  motherId: z.string().min(1, 'Madre es requerida'),
  fatherId: z.string().min(1, 'Padre es requerido'),
  breedingDate: z.string().min(1, 'Fecha de cruza es requerida'),
  breedingMethod: z.enum(['natural', 'artificial_insemination', 'embryo_transfer']),
  expectedDueDate: z.string().optional(),
  actualBirthDate: z.string().optional(),
  pregnancyConfirmed: z.boolean().default(false),
  pregnancyConfirmationDate: z.string().optional(),
  pregnancyMethod: z.enum(['visual', 'ultrasound', 'blood_test', 'palpation']).optional(),
  gestationLength: z.number().optional(),
  offspringCount: z.number().min(0).default(0),
  breedingNotes: z.string().optional(),
  veterinarian: z.string().optional(),
  cost: z.number().optional(),
  status: z.enum(['planned', 'completed', 'confirmed_pregnant', 'not_pregnant', 'birth_completed', 'failed'])
});

type BreedingFormData = z.infer<typeof breedingSchema>;

interface BreedingFormProps {
  record?: BreedingRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

const BreedingForm: React.FC<BreedingFormProps> = ({ record, onSuccess, onCancel }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<BreedingFormData>({
    resolver: zodResolver(breedingSchema),
    defaultValues: {
      motherId: record?.motherId || '',
      fatherId: record?.fatherId || '',
      breedingDate: record?.breedingDate || '',
      breedingMethod: record?.breedingMethod || 'natural',
      expectedDueDate: record?.expectedDueDate || '',
      actualBirthDate: record?.actualBirthDate || '',
      pregnancyConfirmed: record?.pregnancyConfirmed || false,
      pregnancyConfirmationDate: record?.pregnancyConfirmationDate || '',
      pregnancyMethod: record?.pregnancyMethod || undefined,
      gestationLength: record?.gestationLength || undefined,
      offspringCount: record?.offspringCount || 0,
      breedingNotes: record?.breedingNotes || '',
      veterinarian: record?.veterinarian || '',
      cost: record?.cost || undefined,
      status: record?.status || 'planned'
    }
  });

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const allAnimals = await getAllAnimals();
        setAnimals(allAnimals);
      } catch (error) {
        console.error('Error fetching animals:', error);
        toast.error('Error al cargar los animales');
      }
    };

    fetchAnimals();
  }, []);

  const onSubmit = async (data: BreedingFormData) => {
    setLoading(true);
    try {
      const breedingData = {
        ...data,
        gestationLength: data.gestationLength || undefined,
        cost: data.cost || undefined
      };

      let success;
      if (record) {
        success = await updateBreedingRecord(record.id, breedingData);
      } else {
        success = await addBreedingRecord(breedingData);
      }

      if (success) {
        toast.success(record ? 'Registro de cruza actualizado' : 'Registro de cruza creado');
        onSuccess();
      } else {
        toast.error('Error al guardar el registro de cruza');
      }
    } catch (error) {
      console.error('Error saving breeding record:', error);
      toast.error('Error al guardar el registro de cruza');
    } finally {
      setLoading(false);
    }
  };

  const femaleAnimals = animals.filter(animal => animal.gender === 'hembra');
  const maleAnimals = animals.filter(animal => animal.gender === 'macho');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="motherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Madre</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormItem>
                <FormLabel>Fecha de Cruza</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="natural">Natural</SelectItem>
                    <SelectItem value="artificial_insemination">Inseminación Artificial</SelectItem>
                    <SelectItem value="embryo_transfer">Transferencia de Embrión</SelectItem>
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
            name="expectedDueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Esperada de Parto</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planned">Planeado</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="confirmed_pregnant">Preñez Confirmada</SelectItem>
                    <SelectItem value="not_pregnant">No Preñada</SelectItem>
                    <SelectItem value="birth_completed">Parto Completado</SelectItem>
                    <SelectItem value="failed">Fallido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="pregnancyConfirmed"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Preñez Confirmada</FormLabel>
              </div>
            </FormItem>
          )}
        />

        {form.watch('pregnancyConfirmed') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pregnancyConfirmationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Confirmación</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pregnancyMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Confirmación</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="ultrasound">Ultrasonido</SelectItem>
                      <SelectItem value="blood_test">Examen de Sangre</SelectItem>
                      <SelectItem value="palpation">Palpación</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="actualBirthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha Real de Parto</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gestationLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración de Gestación (días)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offspringCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Crías</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="veterinarian"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Veterinario</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre del veterinario" />
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
                <FormLabel>Costo</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                    placeholder="0.00"
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
              <FormLabel>Notas</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Notas adicionales sobre la cruza..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Guardando...' : record ? 'Actualizar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BreedingForm;

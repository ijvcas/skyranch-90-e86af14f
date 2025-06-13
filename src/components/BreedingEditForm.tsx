import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateBreedingRecord, BreedingRecord } from '@/services/breedingService';
import { getAllAnimals } from '@/services/animalService';
import { calculateExpectedDueDate, getSpeciesDisplayName, getGestationPeriod, calculateActualGestationDuration } from '@/services/gestationService';
import { Calendar, Info } from 'lucide-react';

interface BreedingEditFormProps {
  record: BreedingRecord;
  onSuccess: () => void;
}

const BreedingEditForm: React.FC<BreedingEditFormProps> = ({ record, onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motherId: record.motherId,
    fatherId: record.fatherId,
    breedingDate: record.breedingDate,
    breedingMethod: record.breedingMethod,
    expectedDueDate: record.expectedDueDate || '',
    actualBirthDate: record.actualBirthDate || '',
    pregnancyConfirmed: record.pregnancyConfirmed,
    pregnancyConfirmationDate: record.pregnancyConfirmationDate || '',
    pregnancyMethod: record.pregnancyMethod || '',
    gestationLength: record.gestationLength || '',
    offspringCount: record.offspringCount,
    breedingNotes: record.breedingNotes || '',
    veterinarian: record.veterinarian || '',
    cost: record.cost ? record.cost.toString() : '',
    status: record.status
  });

  const [motherSpecies, setMotherSpecies] = useState<string>('');

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateBreedingRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breeding-records'] });
      toast({
        title: "Registro Actualizado",
        description: "El registro de apareamiento ha sido actualizado exitosamente.",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error('Error updating breeding record:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de apareamiento.",
        variant: "destructive"
      });
    }
  });

  // Update mother species when mother is selected
  useEffect(() => {
    if (formData.motherId) {
      const selectedMother = animals.find(animal => animal.id === formData.motherId);
      if (selectedMother?.species) {
        setMotherSpecies(selectedMother.species);
      }
    } else {
      setMotherSpecies('');
    }
  }, [formData.motherId, animals]);

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
      actualBirthDate: formData.actualBirthDate || undefined,
      pregnancyConfirmed: formData.pregnancyConfirmed,
      pregnancyConfirmationDate: formData.pregnancyConfirmationDate || undefined,
      pregnancyMethod: formData.pregnancyMethod || undefined,
      gestationLength: formData.gestationLength ? parseInt(formData.gestationLength.toString()) : undefined,
      offspringCount: formData.offspringCount,
      breedingNotes: formData.breedingNotes || undefined,
      veterinarian: formData.veterinarian || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      status: formData.status
    };

    updateMutation.mutate({ id: record.id, data: submitData });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate gestation duration if both dates are available
  const gestationDuration = formData.breedingDate && formData.actualBirthDate 
    ? calculateActualGestationDuration(formData.breedingDate, formData.actualBirthDate)
    : null;

  // Get expected gestation period for the species
  const expectedGestationPeriod = motherSpecies ? getGestationPeriod(motherSpecies) : null;

  const handleRecalculateDate = () => {
    if (formData.motherId && formData.breedingDate) {
      const selectedMother = animals.find(animal => animal.id === formData.motherId);
      if (selectedMother?.species) {
        const calculatedDate = calculateExpectedDueDate(formData.breedingDate, selectedMother.species);
        if (calculatedDate) {
          setFormData(prev => ({ ...prev, expectedDueDate: calculatedDate }));
          toast({
            title: "Fecha Recalculada",
            description: `Fecha esperada de parto actualizada basada en ${getSpeciesDisplayName(selectedMother.species)}`,
          });
        }
      }
    }
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
                      {animal.name} (#{animal.tag}) - {animal.species}
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
                      {animal.name} (#{animal.tag}) - {animal.species}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="expectedDueDate">Fecha Esperada de Parto</Label>
              <div className="space-y-2">
                <Input
                  id="expectedDueDate"
                  type="date"
                  value={formData.expectedDueDate}
                  onChange={(e) => handleInputChange('expectedDueDate', e.target.value)}
                />
                {formData.motherId && formData.breedingDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRecalculateDate}
                    className="w-full text-xs"
                  >
                    <Calendar className="w-3 h-3 mr-1" />
                    Recalcular según especie
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="actualBirthDate">Fecha Real de Parto</Label>
              <Input
                id="actualBirthDate"
                type="date"
                value={formData.actualBirthDate}
                onChange={(e) => handleInputChange('actualBirthDate', e.target.value)}
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
          <CardTitle>Información del Embarazo y Parto</CardTitle>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="gestationDuration">Duración de Gestación (días)</Label>
              <div className="space-y-1">
                <Input
                  id="gestationDuration"
                  type="number"
                  value={gestationDuration || formData.gestationLength || ''}
                  readOnly
                  className="bg-gray-50"
                  placeholder={expectedGestationPeriod ? `Esperado: ${expectedGestationPeriod}` : 'Auto-calculado'}
                />
                {expectedGestationPeriod && !gestationDuration && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Info className="w-3 h-3" />
                    <span>Esperado para {getSpeciesDisplayName(motherSpecies)}</span>
                  </div>
                )}
              </div>
            </div>
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
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Registro'}
        </Button>
      </div>
    </form>
  );
};

export default BreedingEditForm;

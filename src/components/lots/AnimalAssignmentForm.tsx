
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useLotStore } from '@/stores/lotStore';
import { useAnimalStore } from '@/stores/animalStore';
import { toast } from 'sonner';

interface AnimalAssignmentFormProps {
  lotId: string;
  onClose: () => void;
}

const AnimalAssignmentForm = ({ lotId, onClose }: AnimalAssignmentFormProps) => {
  const { assignAnimal } = useLotStore();
  const { animals, loadAnimals } = useAnimalStore();
  
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAnimals();
  }, [loadAnimals]);

  // Filter animals that are not currently assigned to any lot
  const availableAnimals = animals.filter(animal => !animal.currentLotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimalId) return;

    setIsSubmitting(true);
    try {
      const success = await assignAnimal(selectedAnimalId, lotId, reason, notes);
      if (success) {
        toast.success('Animal asignado exitosamente');
        onClose();
      } else {
        toast.error('Error al asignar el animal');
      }
    } catch (error) {
      console.error('Error assigning animal:', error);
      toast.error('Error al asignar el animal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="animal">Seleccionar Animal *</Label>
        <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un animal" />
          </SelectTrigger>
          <SelectContent>
            {availableAnimals.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">
                No hay animales disponibles
              </div>
            ) : (
              availableAnimals.map((animal) => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name} - {animal.tag} ({animal.species})
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {availableAnimals.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Todos los animales están asignados a lotes
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="reason">Motivo de la Asignación</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Rotación programada, separación por género, etc."
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales sobre esta asignación..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedAnimalId || availableAnimals.length === 0}
        >
          {isSubmitting ? 'Asignando...' : 'Asignar Animal'}
        </Button>
      </div>
    </form>
  );
};

export default AnimalAssignmentForm;

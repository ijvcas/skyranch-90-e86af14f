
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/services/calendarService';
import { getAllAnimals } from '@/services/animalService';
import { useQuery } from '@tanstack/react-query';
import UserSelector from '@/components/notifications/UserSelector';

interface EventEditDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventData: Partial<CalendarEvent>, selectedUserIds: string[]) => void;
  onDelete: (eventId: string) => void;
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
}

const EventEditDialog = ({ 
  event, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  selectedUserIds, 
  onUserSelectionChange 
}: EventEditDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedEvent, setEditedEvent] = useState({
    title: '',
    description: '',
    eventType: 'appointment' as CalendarEvent['eventType'],
    animalId: '',
    eventDate: '',
    veterinarian: '',
    location: '',
    cost: '',
    notes: ''
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  useEffect(() => {
    if (event) {
      setEditedEvent({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType,
        animalId: event.animalId || '',
        eventDate: event.eventDate.split('T')[0], // Extract date part
        veterinarian: event.veterinarian || '',
        location: event.location || '',
        cost: event.cost ? event.cost.toString() : '',
        notes: event.notes || ''
      });
    }
  }, [event]);

  const handleSave = async () => {
    if (!event || !editedEvent.title || isSubmitting) return;

    setIsSubmitting(true);
    
    const eventData = {
      ...editedEvent,
      eventDate: new Date(editedEvent.eventDate).toISOString(),
      cost: editedEvent.cost ? parseFloat(editedEvent.cost) : undefined
    };

    await onSave(eventData, selectedUserIds);
    setIsSubmitting(false);
  };

  const handleDelete = () => {
    if (!event || isSubmitting) return;
    onDelete(event.id);
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título *</Label>
              <Input
                id="edit-title"
                value={editedEvent.title}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del evento"
              />
            </div>

            <div>
              <Label htmlFor="edit-date">Fecha *</Label>
              <Input
                id="edit-date"
                type="date"
                value={editedEvent.eventDate}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>

            <div>
              <Label>Tipo de Evento</Label>
              <Select 
                value={editedEvent.eventType} 
                onValueChange={(value: CalendarEvent['eventType']) => 
                  setEditedEvent(prev => ({ ...prev, eventType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaccination">Vacunación</SelectItem>
                  <SelectItem value="checkup">Revisión</SelectItem>
                  <SelectItem value="breeding">Reproducción</SelectItem>
                  <SelectItem value="treatment">Tratamiento</SelectItem>
                  <SelectItem value="feeding">Alimentación</SelectItem>
                  <SelectItem value="appointment">Cita</SelectItem>
                  <SelectItem value="reminder">Recordatorio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Animal (Opcional)</Label>
              <Select 
                value={editedEvent.animalId} 
                onValueChange={(value) => setEditedEvent(prev => ({ ...prev, animalId: value }))}
              >
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
              <Label htmlFor="edit-veterinarian">Veterinario</Label>
              <Input
                id="edit-veterinarian"
                value={editedEvent.veterinarian}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, veterinarian: e.target.value }))}
                placeholder="Nombre del veterinario"
              />
            </div>

            <div>
              <Label htmlFor="edit-location">Ubicación</Label>
              <Input
                id="edit-location"
                value={editedEvent.location}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ubicación del evento"
              />
            </div>

            <div>
              <Label htmlFor="edit-cost">Costo</Label>
              <Input
                id="edit-cost"
                type="number"
                value={editedEvent.cost}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={editedEvent.description}
                onChange={(e) => setEditedEvent(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detalles adicionales"
              />
            </div>
          </div>

          <div>
            <UserSelector
              selectedUserIds={selectedUserIds}
              onUserSelectionChange={onUserSelectionChange}
            />
          </div>
        </div>

        <div className="flex justify-between gap-2 mt-4">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting || !editedEvent.title}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventEditDialog;

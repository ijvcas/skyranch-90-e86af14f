
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/services/calendarService';
import { getAllAnimals } from '@/services/animalService';
import { useQuery } from '@tanstack/react-query';
import UserSelector from '@/components/notifications/UserSelector';

interface EventFormProps {
  selectedDate: Date | undefined;
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
  onSubmit: (eventData: any, selectedUserIds: string[]) => void;
  isSubmitting: boolean;
}

const EventForm = ({ 
  selectedDate, 
  selectedUserIds, 
  onUserSelectionChange, 
  onSubmit, 
  isSubmitting 
}: EventFormProps) => {
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'appointment' as CalendarEvent['eventType'],
    animalId: '',
    eventDate: '',
    allDay: false,
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
    if (selectedDate) {
      setNewEvent(prev => ({
        ...prev,
        eventDate: selectedDate.toISOString().split('T')[0]
      }));
    }
  }, [selectedDate]);

  const handleSubmit = () => {
    if (!newEvent.title || !newEvent.eventDate || isSubmitting) return;

    const eventData = {
      ...newEvent,
      eventDate: new Date(newEvent.eventDate).toISOString(),
      status: 'scheduled' as const,
      allDay: newEvent.allDay,
      recurring: false,
      reminderMinutes: 60,
      cost: newEvent.cost ? parseFloat(newEvent.cost) : undefined
    };

    onSubmit(eventData, selectedUserIds);
    
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      eventType: 'appointment',
      animalId: '',
      eventDate: selectedDate?.toISOString().split('T')[0] || '',
      allDay: false,
      veterinarian: '',
      location: '',
      cost: '',
      notes: ''
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título del evento"
          />
        </div>

        <div>
          <Label htmlFor="event-date">Fecha *</Label>
          <Input
            id="event-date"
            type="date"
            value={newEvent.eventDate}
            onChange={(e) => setNewEvent(prev => ({ ...prev, eventDate: e.target.value }))}
          />
        </div>

        <div>
          <Label>Tipo de Evento</Label>
          <Select 
            value={newEvent.eventType} 
            onValueChange={(value: CalendarEvent['eventType']) => 
              setNewEvent(prev => ({ ...prev, eventType: value }))
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
            value={newEvent.animalId} 
            onValueChange={(value) => setNewEvent(prev => ({ ...prev, animalId: value }))}
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
          <Label htmlFor="veterinarian">Veterinario</Label>
          <Input
            id="veterinarian"
            value={newEvent.veterinarian}
            onChange={(e) => setNewEvent(prev => ({ ...prev, veterinarian: e.target.value }))}
            placeholder="Nombre del veterinario"
          />
        </div>

        <div>
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            value={newEvent.location}
            onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ubicación del evento"
          />
        </div>

        <div>
          <Label htmlFor="cost">Costo</Label>
          <Input
            id="cost"
            type="number"
            value={newEvent.cost}
            onChange={(e) => setNewEvent(prev => ({ ...prev, cost: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={newEvent.description}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
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

      <Button 
        onClick={handleSubmit} 
        className="w-full mt-4 col-span-2"
        disabled={isSubmitting || !newEvent.title || !newEvent.eventDate}
      >
        {isSubmitting ? 'Creando...' : 'Crear Evento'}
      </Button>
    </div>
  );
};

export default EventForm;

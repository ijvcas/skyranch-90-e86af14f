
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/services/calendarService';
import { getAllAnimals } from '@/services/animalService';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import UserSelector from '@/components/notifications/UserSelector';
import DatePickerField from './DatePickerField';
import EventTypeSelect from './EventTypeSelect';

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

  // Set today's date when component mounts or selectedDate changes
  useEffect(() => {
    const dateToUse = selectedDate || new Date();
    const formattedDate = format(dateToUse, 'yyyy-MM-dd');
    setNewEvent(prev => ({
      ...prev,
      eventDate: formattedDate
    }));
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
    const today = format(new Date(), 'yyyy-MM-dd');
    setNewEvent({
      title: '',
      description: '',
      eventType: 'appointment',
      animalId: '',
      eventDate: today,
      allDay: false,
      veterinarian: '',
      location: '',
      cost: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={newEvent.title}
            onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Título del evento"
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePickerField
            value={newEvent.eventDate}
            onChange={(date) => setNewEvent(prev => ({ ...prev, eventDate: date }))}
            label="Fecha"
            required
          />

          <EventTypeSelect
            value={newEvent.eventType}
            onChange={(value) => setNewEvent(prev => ({ ...prev, eventType: value }))}
            label="Tipo de Evento"
          />
        </div>

        <div className="space-y-2">
          <Label>Animal (Opcional)</Label>
          <Select 
            value={newEvent.animalId} 
            onValueChange={(value) => setNewEvent(prev => ({ ...prev, animalId: value }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar animal" />
            </SelectTrigger>
            <SelectContent className="z-[9999]">
              {animals.map(animal => (
                <SelectItem key={animal.id} value={animal.id}>
                  {animal.name} (#{animal.tag})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="veterinarian">Veterinario</Label>
            <Input
              id="veterinarian"
              value={newEvent.veterinarian}
              onChange={(e) => setNewEvent(prev => ({ ...prev, veterinarian: e.target.value }))}
              placeholder="Nombre del veterinario"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">Costo</Label>
            <Input
              id="cost"
              type="number"
              value={newEvent.cost}
              onChange={(e) => setNewEvent(prev => ({ ...prev, cost: e.target.value }))}
              placeholder="0.00"
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            value={newEvent.location}
            onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Ubicación del evento"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={newEvent.description}
            onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detalles adicionales"
            className="w-full"
          />
        </div>
      </div>

      <UserSelector
        selectedUserIds={selectedUserIds}
        onUserSelectionChange={onUserSelectionChange}
      />

      <Button 
        onClick={handleSubmit} 
        className="w-full"
        disabled={isSubmitting || !newEvent.title || !newEvent.eventDate}
      >
        {isSubmitting ? 'Creando...' : 'Crear Evento'}
      </Button>
    </div>
  );
};

export default EventForm;

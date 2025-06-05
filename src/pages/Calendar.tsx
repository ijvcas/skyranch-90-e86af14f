
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon, Bell, MapPin, DollarSign } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCalendarEvents, addCalendarEvent, CalendarEvent } from '@/services/calendarService';
import { getAllAnimals } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    eventType: 'appointment' as CalendarEvent['eventType'],
    animalId: '',
    allDay: false,
    veterinarian: '',
    location: '',
    cost: '',
    notes: ''
  });

  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents
  });

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const eventsForSelectedDate = events.filter(event => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.eventDate);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  const handleCreateEvent = async () => {
    if (!newEvent.title || !selectedDate) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const eventData = {
      ...newEvent,
      eventDate: selectedDate.toISOString(),
      status: 'scheduled' as const,
      allDay: newEvent.allDay,
      recurring: false,
      reminderMinutes: 60,
      cost: newEvent.cost ? parseFloat(newEvent.cost) : undefined
    };

    const success = await addCalendarEvent(eventData);
    if (success) {
      toast({
        title: "Éxito",
        description: "Evento creado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsDialogOpen(false);
      setNewEvent({
        title: '',
        description: '',
        eventType: 'appointment',
        animalId: '',
        allDay: false,
        veterinarian: '',
        location: '',
        cost: '',
        notes: ''
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive"
      });
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      case 'breeding':
        return 'bg-pink-100 text-pink-800';
      case 'treatment':
        return 'bg-red-100 text-red-800';
      case 'feeding':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'vaccination':
        return 'Vacunación';
      case 'checkup':
        return 'Revisión';
      case 'breeding':
        return 'Reproducción';
      case 'treatment':
        return 'Tratamiento';
      case 'feeding':
        return 'Alimentación';
      case 'appointment':
        return 'Cita';
      case 'reminder':
        return 'Recordatorio';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4 pb-24">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Panel
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Calendario de Eventos
              </h1>
              <p className="text-gray-600">Gestiona citas, vacunaciones y recordatorios</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                </DialogHeader>
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

                  <Button onClick={handleCreateEvent} className="w-full">
                    Crear Evento
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                Eventos - {selectedDate?.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-3">
                  {eventsForSelectedDate.map(event => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={getEventTypeColor(event.eventType)}>
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      <div className="space-y-1 text-xs text-gray-500">
                        {event.veterinarian && (
                          <div className="flex items-center">
                            <Bell className="w-3 h-3 mr-1" />
                            {event.veterinarian}
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.cost && (
                          <div className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            ${event.cost}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay eventos para esta fecha</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events
                .filter(event => new Date(event.eventDate) >= new Date())
                .slice(0, 6)
                .map(event => (
                  <div key={event.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{event.title}</h4>
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {getEventTypeLabel(event.eventType)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(event.eventDate).toLocaleDateString('es-ES')}
                    </p>
                    {event.animalId && (
                      <p className="text-xs text-gray-500 mt-1">
                        Animal: {animals.find(a => a.id === event.animalId)?.name || 'N/A'}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;

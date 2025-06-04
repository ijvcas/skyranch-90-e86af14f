
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Plus, Edit, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'vacuna' | 'revision' | 'pesaje' | 'tratamiento';
  animalId: string;
  description: string;
  completed: boolean;
}

const Calendar = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Vacunación - Bella',
      date: '2024-06-05',
      type: 'vacuna',
      animalId: '001',
      description: 'Vacuna anual contra brucelosis',
      completed: false
    },
    {
      id: '2',
      title: 'Revisión Gestación - Luna',
      date: '2024-06-08',
      type: 'revision',
      animalId: '003',
      description: 'Control prenatal',
      completed: false
    },
    {
      id: '3',
      title: 'Pesaje General',
      date: '2024-06-12',
      type: 'pesaje',
      animalId: 'todos',
      description: 'Pesaje mensual de todos los animales',
      completed: false
    },
    {
      id: '4',
      title: 'Tratamiento - Max',
      date: '2024-06-15',
      type: 'tratamiento',
      animalId: '002',
      description: 'Continuación tratamiento antibiótico',
      completed: false
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'vacuna' as CalendarEvent['type'],
    animalId: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'vacuna':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-green-100 text-green-800';
      case 'pesaje':
        return 'bg-purple-100 text-purple-800';
      case 'tratamiento':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateEvent = () => {
    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: newEvent.date,
      type: newEvent.type,
      animalId: newEvent.animalId,
      description: newEvent.description,
      completed: false
    };
    
    setEvents([...events, event]);
    setShowEventDialog(false);
    setNewEvent({
      title: '',
      type: 'vacuna',
      animalId: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      type: event.type,
      animalId: event.animalId,
      description: event.description,
      date: event.date
    });
    setShowEventDialog(true);
  };

  const handleUpdateEvent = () => {
    if (editingEvent) {
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...newEvent }
          : event
      ));
      setShowEventDialog(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        type: 'vacuna',
        animalId: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
      });
    }
  };

  const handleCompleteEvent = (eventId: string) => {
    setEvents(events.map(event =>
      event.id === eventId
        ? { ...event, completed: !event.completed }
        : event
    ));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(event => event.date === dateStr);
  };

  const upcomingEvents = events
    .filter(event => !event.completed && new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const thisWeekEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  const thisMonthEvents = upcomingEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate.getMonth() === today.getMonth() && eventDate.getFullYear() === today.getFullYear();
  });

  const overdueEvents = events.filter(event => {
    return !event.completed && new Date(event.date) < new Date();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto">
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
              <p className="text-gray-600">Gestión completa de citas y recordatorios</p>
            </div>
            <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0"
                  onClick={() => {
                    setEditingEvent(null);
                    setNewEvent({
                      title: '',
                      type: 'vacuna',
                      animalId: '',
                      description: '',
                      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingEvent ? 'Modifica los detalles del evento' : 'Completa la información del nuevo evento'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">
                      Título
                    </Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Tipo
                    </Label>
                    <Select value={newEvent.type} onValueChange={(value: CalendarEvent['type']) => setNewEvent({...newEvent, type: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacuna">Vacuna</SelectItem>
                        <SelectItem value="revision">Revisión</SelectItem>
                        <SelectItem value="pesaje">Pesaje</SelectItem>
                        <SelectItem value="tratamiento">Tratamiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="animalId" className="text-right">
                      ID Animal
                    </Label>
                    <Input
                      id="animalId"
                      value={newEvent.animalId}
                      onChange={(e) => setNewEvent({...newEvent, animalId: e.target.value})}
                      className="col-span-3"
                      placeholder="001, 002, todos, etc."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">
                      Fecha
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}>
                    {editingEvent ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{thisWeekEvents.length}</div>
              <div className="text-sm text-gray-600">Esta semana</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{thisMonthEvents.length}</div>
              <div className="text-sm text-gray-600">Este mes</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{overdueEvents.length}</div>
              <div className="text-sm text-gray-600">Atrasados</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{events.filter(e => e.completed).length}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Component */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-900">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Vista de Calendario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvents: { 
                    backgroundColor: 'rgb(34 197 94)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
              />
              {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    Eventos para {format(selectedDate, 'dd/MM/yyyy')}:
                  </h4>
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map((event) => (
                      <div key={event.id} className="p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className={event.completed ? 'line-through text-gray-500' : ''}>
                            {event.title}
                          </span>
                          <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-900">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay eventos próximos</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div 
                    key={event.id}
                    className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                      event.completed ? 'bg-gray-50 opacity-60' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <h3 className={`font-semibold text-gray-900 mb-2 md:mb-0 ${
                        event.completed ? 'line-through' : ''
                      }`}>
                        {event.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getEventTypeColor(event.type)}`}>
                          {event.type}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          #{event.animalId}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      📅 {formatDate(event.date)}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">
                      {event.description}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant={event.completed ? "secondary" : "default"}
                        onClick={() => handleCompleteEvent(event.id)}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        {event.completed ? 'Desmarcar' : 'Completar'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;

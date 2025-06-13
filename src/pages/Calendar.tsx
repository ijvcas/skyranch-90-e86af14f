
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import EventForm from '@/components/calendar/EventForm';
import EventList from '@/components/calendar/EventList';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';
import EventEditDialog from '@/components/calendar/EventEditDialog';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/services/calendarService';

const CalendarPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { events, createEvent, updateEvent, deleteEvent, getNotificationUsers, isSubmitting } = useCalendarEvents();

  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  const handleCreateEvent = async (eventData: any, selectedUserIds: string[]) => {
    console.log('📅 Creating event with selected users:', selectedUserIds);
    await createEvent(eventData, selectedUserIds);
    setIsDialogOpen(false);
    setSelectedUserIds([]);
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    console.log('📅 Editing event:', event.title);
    setSelectedEventForEdit(event);
    // Load the selected users for this event
    const notificationUsers = await getNotificationUsers(event.id);
    console.log('📅 Loaded notification users for event:', notificationUsers);
    setSelectedUserIds(notificationUsers);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedEvent = async (eventData: Partial<CalendarEvent>, selectedUserIds: string[]) => {
    if (!selectedEventForEdit) return;
    console.log('📅 Saving edited event with selected users:', selectedUserIds);
    await updateEvent(selectedEventForEdit.id, eventData, selectedUserIds);
    setIsEditDialogOpen(false);
    setSelectedEventForEdit(null);
    setSelectedUserIds([]);
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log('📅 Deleting event:', eventId);
    await deleteEvent(eventId);
    setIsEditDialogOpen(false);
    setSelectedEventForEdit(null);
    setSelectedUserIds([]);
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
          
          {/* Notification Permission Banner */}
          <NotificationPermissionBanner />
          
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Evento</DialogTitle>
                </DialogHeader>
                <EventForm
                  selectedDate={selectedDate}
                  selectedUserIds={selectedUserIds}
                  onUserSelectionChange={setSelectedUserIds}
                  onSubmit={handleCreateEvent}
                  isSubmitting={isSubmitting}
                />
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
              <EventList
                events={events}
                selectedDate={selectedDate}
                onEditEvent={handleEditEvent}
              />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div className="mt-6">
          <UpcomingEvents
            events={events}
            animals={animals}
            onEditEvent={handleEditEvent}
          />
        </div>

        {/* Event Edit Dialog */}
        <EventEditDialog
          event={selectedEventForEdit}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedEventForEdit(null);
            setSelectedUserIds([]);
          }}
          onSave={handleSaveEditedEvent}
          onDelete={handleDeleteEvent}
          selectedUserIds={selectedUserIds}
          onUserSelectionChange={setSelectedUserIds}
        />
      </div>
    </div>
  );
};

export default CalendarPage;

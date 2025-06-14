
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import EventList from '@/components/calendar/EventList';
import UpcomingEvents from '@/components/calendar/UpcomingEvents';
import { CalendarEvent } from '@/services/calendarService';

interface CalendarContentProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarContent = ({
  selectedDate,
  onSelectDate,
  events,
  onEditEvent,
  onEventClick
}: CalendarContentProps) => {
  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals
  });

  return (
    <>
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
              onSelect={onSelectDate}
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
              onEditEvent={onEditEvent}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div className="mt-6">
        <UpcomingEvents
          events={events}
          animals={animals}
          onEventClick={onEventClick}
        />
      </div>
    </>
  );
};

export default CalendarContent;

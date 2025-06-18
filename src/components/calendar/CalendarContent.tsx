
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={onSelectDate}
                className="rounded-md border w-full max-w-md mx-auto"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4 w-full",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-gray-300 rounded-md hover:bg-gray-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-xs sm:text-sm",
                  row: "flex w-full mt-2",
                  cell: "h-8 w-8 sm:h-9 sm:w-9 text-center text-xs sm:text-sm p-0 relative hover:bg-gray-100 rounded-md cursor-pointer",
                  day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal hover:bg-gray-100 rounded-md",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground font-medium",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Events for Selected Date */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm sm:text-base">
              Eventos - {selectedDate?.toLocaleDateString('es-ES', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <EventList
              events={events}
              selectedDate={selectedDate}
              onEditEvent={onEditEvent}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div className="mt-4 lg:mt-6">
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

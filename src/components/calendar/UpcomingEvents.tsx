
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { CalendarEvent } from '@/services/calendarService';
import { Animal } from '@/services/animalService';

interface UpcomingEventsProps {
  events: CalendarEvent[];
  animals: Animal[];
  onEditEvent: (event: CalendarEvent) => void;
}

const UpcomingEvents = ({ events, animals, onEditEvent }: UpcomingEventsProps) => {
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

  const upcomingEvents = events
    .filter(event => new Date(event.eventDate) >= new Date())
    .slice(0, 6);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingEvents.map(event => (
            <div key={event.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{event.title}</h4>
                <div className="flex items-center space-x-2">
                  <Badge className={getEventTypeColor(event.eventType)}>
                    {getEventTypeLabel(event.eventType)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditEvent(event)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
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
  );
};

export default UpcomingEvents;

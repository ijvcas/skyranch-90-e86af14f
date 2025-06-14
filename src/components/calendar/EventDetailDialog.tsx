
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Calendar, MapPin, DollarSign, User, Clock } from 'lucide-react';
import { CalendarEvent } from '@/services/calendarService';

interface Animal {
  id: string;
  name: string;
}

interface EventDetailDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  animals: Animal[];
}

const EventDetailDialog = ({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  animals 
}: EventDetailDialogProps) => {
  if (!event) return null;

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

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const animalName = event.animalId 
    ? animals.find(a => a.id === event.animalId)?.name 
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{event.title}</span>
            <Badge className={getEventTypeColor(event.eventType)}>
              {getEventTypeLabel(event.eventType)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                {new Date(event.eventDate).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>

            {event.endDate && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">
                  Hasta: {new Date(event.endDate).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}

            {animalName && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Animal: {animalName}</span>
              </div>
            )}

            {event.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{event.location}</span>
              </div>
            )}

            {event.veterinarian && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Veterinario: {event.veterinarian}</span>
              </div>
            )}

            {event.cost && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Costo: ${event.cost}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Descripción</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {event.description}
              </p>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div>
              <h4 className="font-medium mb-2">Notas</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                {event.notes}
              </p>
            </div>
          )}

          {/* Status and Reminder */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={event.status === 'completed' ? 'default' : 'secondary'}>
              Estado: {event.status === 'completed' ? 'Completado' : 
                      event.status === 'cancelled' ? 'Cancelado' :
                      event.status === 'missed' ? 'Perdido' : 'Programado'}
            </Badge>
            {event.reminderMinutes > 0 && (
              <Badge variant="outline">
                Recordatorio: {event.reminderMinutes} min antes
              </Badge>
            )}
            {event.allDay && (
              <Badge variant="outline">Todo el día</Badge>
            )}
            {event.recurring && (
              <Badge variant="outline">Recurrente</Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onEdit(event);
                onClose();
              }}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailDialog;

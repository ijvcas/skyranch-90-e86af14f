
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import EventForm from '@/components/calendar/EventForm';
import NotificationPermissionBanner from '@/components/NotificationPermissionBanner';

interface CalendarHeaderProps {
  selectedDate: Date | undefined;
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
  onSubmit: (eventData: any, selectedUserIds: string[]) => void;
  isSubmitting: boolean;
  isDialogOpen: boolean;
  onOpenDialog: () => void;
  onCloseDialog: () => void;
}

const CalendarHeader = ({
  selectedDate,
  selectedUserIds,
  onUserSelectionChange,
  onSubmit,
  isSubmitting,
  isDialogOpen,
  onOpenDialog,
  onCloseDialog
}: CalendarHeaderProps) => {
  const navigate = useNavigate();

  const handleDialogOpenChange = (open: boolean) => {
    console.log('📅 Dialog open state changing to:', open);
    if (open) {
      onOpenDialog();
    } else {
      onCloseDialog();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📅 New Event button clicked, current dialog state:', isDialogOpen);
    if (!isDialogOpen) {
      onOpenDialog();
    }
  };

  return (
    <div className="mb-8">
      <Button 
        variant="outline" 
        onClick={() => navigate('/dashboard')}
        className="mb-4"
      >
        ← Volver al Panel
      </Button>
      
      <NotificationPermissionBanner />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Calendario de Eventos
          </h1>
          <p className="text-gray-600">Gestiona citas, vacunaciones y recordatorios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0 min-h-[44px] px-6 touch-manipulation active:scale-95 transition-transform"
              onClick={handleButtonClick}
              disabled={isSubmitting}
              aria-label="Crear nuevo evento"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Creando...' : 'Nuevo Evento'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Evento</DialogTitle>
            </DialogHeader>
            <EventForm
              selectedDate={selectedDate}
              selectedUserIds={selectedUserIds}
              onUserSelectionChange={onUserSelectionChange}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CalendarHeader;

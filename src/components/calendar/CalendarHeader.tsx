
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [isButtonPressed, setIsButtonPressed] = React.useState(false);
  const [lastTouchTime, setLastTouchTime] = React.useState(0);

  const handleButtonClick = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    if (now - lastTouchTime < 300) {
      console.log('📅 Button click debounced');
      return;
    }
    setLastTouchTime(now);
    
    console.log('📅 New Event button activated, current dialog state:', isDialogOpen);
    if (!isDialogOpen && !isSubmitting) {
      console.log('📅 Opening dialog...');
      onOpenDialog();
    }
  }, [isDialogOpen, isSubmitting, onOpenDialog, lastTouchTime]);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsButtonPressed(true);
    console.log('📅 Touch start on New Event button');
  }, []);

  const handleTouchEnd = React.useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsButtonPressed(false);
    console.log('📅 Touch end on New Event button');
    handleButtonClick(e);
  }, [handleButtonClick]);

  const handleDialogClose = React.useCallback((open: boolean) => {
    console.log('📅 Dialog state changing to:', open);
    if (!open) {
      onCloseDialog();
    }
  }, [onCloseDialog]);

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
        
        <Button 
          className={`bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0 min-h-[48px] px-6 touch-manipulation transition-all duration-150 ${
            isButtonPressed ? 'scale-95 bg-green-800' : ''
          } ${isSubmitting ? 'opacity-75' : ''}`}
          onClick={handleButtonClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={isSubmitting}
          aria-label="Crear nuevo evento"
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            userSelect: 'none'
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? 'Creando...' : 'Nuevo Evento'}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ zIndex: 9999 }}>
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
  );
};

export default CalendarHeader;


import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Plus } from 'lucide-react';
import EventForm from './EventForm';
import EmailTestButton from './EmailTestButton';

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
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">Calendario de Eventos</h1>
        </div>
        <div className="flex gap-2">
          <EmailTestButton />
          <Dialog open={isDialogOpen} onOpenChange={(open) => open ? onOpenDialog() : onCloseDialog()}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
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
                onUserSelectionChange={onUserSelectionChange}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;

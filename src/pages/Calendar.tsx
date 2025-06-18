
import React from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarState } from '@/hooks/useCalendarState';
import { CalendarEvent } from '@/services/calendarService';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarContent from '@/components/calendar/CalendarContent';
import CalendarDialogs from '@/components/calendar/CalendarDialogs';

const CalendarPage = () => {
  const {
    selectedDate,
    setSelectedDate,
    isDialogOpen,
    isEditDialogOpen,
    isDetailDialogOpen,
    selectedEventForEdit,
    selectedEventForDetail,
    selectedUserIds,
    setSelectedUserIds,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDetailDialog,
    closeDetailDialog
  } = useCalendarState();

  const { events, createEvent, updateEvent, deleteEvent, getNotificationUsers, isSubmitting } = useCalendarEvents();

  const handleCreateEvent = async (eventData: any, selectedUserIds: string[]) => {
    console.log('📅 Creating event with selected users:', selectedUserIds);
    try {
      await createEvent(eventData, selectedUserIds);
      closeCreateDialog();
    } catch (error) {
      console.error('📅 Error creating event:', error);
      // Dialog will remain open so user can retry
    }
  };

  const handleEditEvent = async (event: CalendarEvent) => {
    console.log('📅 Editing event:', event.title);
    try {
      const notificationUsers = await getNotificationUsers(event.id);
      console.log('📅 Loaded notification users for event:', notificationUsers);
      openEditDialog(event, notificationUsers);
    } catch (error) {
      console.error('📅 Error loading event for edit:', error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('📅 Event clicked:', event.title);
    openDetailDialog(event);
  };

  const handleSaveEditedEvent = async (eventData: Partial<CalendarEvent>, selectedUserIds: string[]) => {
    if (!selectedEventForEdit) return;
    console.log('📅 Saving edited event with selected users:', selectedUserIds);
    try {
      await updateEvent(selectedEventForEdit.id, eventData, selectedUserIds);
      closeEditDialog();
    } catch (error) {
      console.error('📅 Error updating event:', error);
      // Dialog will remain open so user can retry
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log('📅 Deleting event:', eventId);
    try {
      await deleteEvent(eventId);
      closeEditDialog();
      closeDetailDialog();
    } catch (error) {
      console.error('📅 Error deleting event:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-2 sm:p-4 pb-20 sm:pb-24">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <CalendarHeader
          selectedDate={selectedDate}
          selectedUserIds={selectedUserIds}
          onUserSelectionChange={setSelectedUserIds}
          onSubmit={handleCreateEvent}
          isSubmitting={isSubmitting}
          isDialogOpen={isDialogOpen}
          onOpenDialog={openCreateDialog}
          onCloseDialog={closeCreateDialog}
        />

        <CalendarContent
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          events={events}
          onEditEvent={handleEditEvent}
          onEventClick={handleEventClick}
        />

        <CalendarDialogs
          selectedEventForEdit={selectedEventForEdit}
          selectedEventForDetail={selectedEventForDetail}
          isEditDialogOpen={isEditDialogOpen}
          isDetailDialogOpen={isDetailDialogOpen}
          selectedUserIds={selectedUserIds}
          onUserSelectionChange={setSelectedUserIds}
          onCloseEditDialog={closeEditDialog}
          onCloseDetailDialog={closeDetailDialog}
          onSaveEditedEvent={handleSaveEditedEvent}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={handleEditEvent}
        />
      </div>
    </div>
  );
};

export default CalendarPage;

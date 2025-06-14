
import { useState } from 'react';
import { CalendarEvent } from '@/services/calendarService';

export const useCalendarState = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<CalendarEvent | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const openCreateDialog = () => {
    console.log('📅 Opening create dialog');
    setIsDialogOpen(true);
  };
  
  const closeCreateDialog = () => {
    console.log('📅 Closing create dialog');
    setIsDialogOpen(false);
    setSelectedUserIds([]);
  };

  const openEditDialog = (event: CalendarEvent, notificationUsers: string[]) => {
    console.log('📅 Opening edit dialog for event:', event.title);
    setSelectedEventForEdit(event);
    setSelectedUserIds(notificationUsers);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    console.log('📅 Closing edit dialog');
    setIsEditDialogOpen(false);
    setSelectedEventForEdit(null);
    setSelectedUserIds([]);
  };

  const openDetailDialog = (event: CalendarEvent) => {
    console.log('📅 Opening detail dialog for event:', event.title);
    setSelectedEventForDetail(event);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
    console.log('📅 Closing detail dialog');
    setIsDetailDialogOpen(false);
    setSelectedEventForDetail(null);
  };

  return {
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
  };
};

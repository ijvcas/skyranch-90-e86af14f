
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

  const openCreateDialog = () => setIsDialogOpen(true);
  const closeCreateDialog = () => {
    setIsDialogOpen(false);
    setSelectedUserIds([]);
  };

  const openEditDialog = (event: CalendarEvent, notificationUsers: string[]) => {
    setSelectedEventForEdit(event);
    setSelectedUserIds(notificationUsers);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedEventForEdit(null);
    setSelectedUserIds([]);
  };

  const openDetailDialog = (event: CalendarEvent) => {
    setSelectedEventForDetail(event);
    setIsDetailDialogOpen(true);
  };

  const closeDetailDialog = () => {
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

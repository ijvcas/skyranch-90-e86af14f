
import { supabase } from '@/integrations/supabase/client';

export interface CalendarEvent {
  id: string;
  userId: string;
  animalId?: string;
  title: string;
  description?: string;
  eventType: 'vaccination' | 'checkup' | 'breeding' | 'feeding' | 'treatment' | 'appointment' | 'reminder';
  eventDate: string;
  endDate?: string;
  allDay: boolean;
  recurring: boolean;
  recurrencePattern?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  reminderMinutes: number;
  veterinarian?: string;
  location?: string;
  cost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .order('event_date', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }

  return (data || []).map(event => ({
    id: event.id,
    userId: event.user_id,
    animalId: event.animal_id || undefined,
    title: event.title,
    description: event.description || undefined,
    eventType: event.event_type as CalendarEvent['eventType'],
    eventDate: event.event_date,
    endDate: event.end_date || undefined,
    allDay: event.all_day || false,
    recurring: event.recurring || false,
    recurrencePattern: event.recurrence_pattern || undefined,
    status: event.status as CalendarEvent['status'],
    reminderMinutes: event.reminder_minutes || 60,
    veterinarian: event.veterinarian || undefined,
    location: event.location || undefined,
    cost: event.cost || undefined,
    notes: event.notes || undefined,
    createdAt: event.created_at,
    updatedAt: event.updated_at
  }));
};

export const addCalendarEvent = async (event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase
    .from('calendar_events')
    .insert({
      user_id: user.id,
      animal_id: event.animalId || null,
      title: event.title,
      description: event.description || null,
      event_type: event.eventType,
      event_date: event.eventDate,
      end_date: event.endDate || null,
      all_day: event.allDay,
      recurring: event.recurring,
      recurrence_pattern: event.recurrencePattern || null,
      status: event.status,
      reminder_minutes: event.reminderMinutes,
      veterinarian: event.veterinarian || null,
      location: event.location || null,
      cost: event.cost || null,
      notes: event.notes || null
    });

  if (error) {
    console.error('Error adding calendar event:', error);
    return false;
  }

  return true;
};

export const updateCalendarEvent = async (id: string, updatedData: Partial<Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('calendar_events')
    .update({
      ...(updatedData.animalId !== undefined && { animal_id: updatedData.animalId || null }),
      ...(updatedData.title && { title: updatedData.title }),
      ...(updatedData.description !== undefined && { description: updatedData.description || null }),
      ...(updatedData.eventType && { event_type: updatedData.eventType }),
      ...(updatedData.eventDate && { event_date: updatedData.eventDate }),
      ...(updatedData.endDate !== undefined && { end_date: updatedData.endDate || null }),
      ...(updatedData.allDay !== undefined && { all_day: updatedData.allDay }),
      ...(updatedData.recurring !== undefined && { recurring: updatedData.recurring }),
      ...(updatedData.recurrencePattern !== undefined && { recurrence_pattern: updatedData.recurrencePattern || null }),
      ...(updatedData.status && { status: updatedData.status }),
      ...(updatedData.reminderMinutes !== undefined && { reminder_minutes: updatedData.reminderMinutes }),
      ...(updatedData.veterinarian !== undefined && { veterinarian: updatedData.veterinarian || null }),
      ...(updatedData.location !== undefined && { location: updatedData.location || null }),
      ...(updatedData.cost !== undefined && { cost: updatedData.cost || null }),
      ...(updatedData.notes !== undefined && { notes: updatedData.notes || null }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }

  return true;
};

export const deleteCalendarEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }

  return true;
};

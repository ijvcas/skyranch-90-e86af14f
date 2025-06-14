
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/userService';
import { getCalendarEvents } from '@/services/calendarService';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import { useCalendarEventOperations } from '@/hooks/useCalendarEventOperations';

export const useCalendarEvents = () => {
  const { data: events = [] } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: getCalendarEvents
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers
  });

  const { sendNotificationsToUsers } = useCalendarNotifications(users);
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    getNotificationUsers,
    isSubmitting
  } = useCalendarEventOperations(sendNotificationsToUsers);

  return {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    getNotificationUsers,
    isSubmitting
  };
};


import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarNotificationProcessor } from '@/services/notifications/calendarNotificationProcessor';

export const useCalendarNotifications = (users: any[]) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const processor = new CalendarNotificationProcessor(toast, queryClient);

  const sendNotificationsToUsers = async (
    selectedUserIds: string[],
    eventTitle: string,
    eventDate: string,
    isUpdate: boolean = false,
    eventDescription?: string,
    eventType?: string,
    location?: string,
    veterinarian?: string
  ) => {
    await processor.processNotifications(
      selectedUserIds,
      users,
      eventTitle,
      eventDate,
      isUpdate,
      eventDescription,
      eventType,
      location,
      veterinarian
    );
  };

  return { sendNotificationsToUsers };
};


export type NotificationType = 
  | 'vaccine' 
  | 'health' 
  | 'breeding' 
  | 'weekly_report' 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'success'
  | 'calendar'
  | 'general';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  actionRequired?: boolean;
  animalName?: string;
}

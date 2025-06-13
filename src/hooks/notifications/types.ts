
export interface Notification {
  id: string;
  type: 'vaccine' | 'health' | 'breeding' | 'weekly_report' | 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  animalName?: string;
  actionRequired?: boolean;
}

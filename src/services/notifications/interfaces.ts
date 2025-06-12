
export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationTemplate {
  type: 'event_created' | 'event_updated' | 'general';
  subject: string;
  body: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'email' | 'push' | 'in_app';
  status: 'sent' | 'failed' | 'pending';
  message: string;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

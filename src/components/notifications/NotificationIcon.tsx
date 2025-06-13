
import React from 'react';
import { Bell, Calendar, Heart, Activity } from 'lucide-react';
import { Notification } from '@/hooks/useNotifications';

interface NotificationIconProps {
  type: Notification['type'];
}

export const NotificationIcon = ({ type }: NotificationIconProps) => {
  switch (type) {
    case 'vaccine':
      return <Calendar className="w-4 h-4 text-blue-500" />;
    case 'health':
      return <Heart className="w-4 h-4 text-red-500" />;
    case 'breeding':
      return <Activity className="w-4 h-4 text-green-500" />;
    case 'weekly_report':
      return <Activity className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

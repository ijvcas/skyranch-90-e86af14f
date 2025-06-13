
import React from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationActionsProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationActions = ({
  unreadCount,
  onMarkAllAsRead,
  onClearAll
}: NotificationActionsProps) => {
  return (
    <div className="flex items-center space-x-2">
      {unreadCount > 0 && (
        <Button onClick={onMarkAllAsRead} variant="outline" size="sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          Marcar todas como leídas
        </Button>
      )}
      
      <Button 
        onClick={onClearAll} 
        variant="outline" 
        size="sm"
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Limpiar todo
      </Button>
    </div>
  );
};

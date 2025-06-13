
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification } from '@/hooks/useNotifications';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationListItem } from './NotificationListItem';

interface NotificationTabsProps {
  unreadNotifications: Notification[];
  readNotifications: Notification[];
  filteredNotifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationTabs = ({
  unreadNotifications,
  readNotifications,
  filteredNotifications,
  unreadCount,
  onMarkAsRead,
  onDelete
}: NotificationTabsProps) => {
  return (
    <Tabs defaultValue="unread" className="space-y-4">
      <TabsList>
        <TabsTrigger value="unread" className="relative">
          Sin leer
          {unreadCount > 0 && (
            <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="read">
          Leídas ({readNotifications.length})
        </TabsTrigger>
        <TabsTrigger value="all">
          Todas ({filteredNotifications.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="unread" className="space-y-4">
        {unreadNotifications.length === 0 ? (
          <NotificationEmptyState type="unread" />
        ) : (
          <div className="space-y-3">
            {unreadNotifications.map(notification => (
              <NotificationListItem 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="read" className="space-y-4">
        {readNotifications.length === 0 ? (
          <NotificationEmptyState type="read" />
        ) : (
          <div className="space-y-3">
            {readNotifications.map(notification => (
              <NotificationListItem 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="all" className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <NotificationEmptyState type="filtered" />
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <NotificationListItem 
                key={notification.id} 
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

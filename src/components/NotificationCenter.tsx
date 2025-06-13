
import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationFilters } from './notifications/NotificationFilters';
import { NotificationActions } from './notifications/NotificationActions';
import { NotificationTabs } from './notifications/NotificationTabs';

const NotificationCenter = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.animalName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    return matchesSearch && matchesPriority && matchesType;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  const readNotifications = filteredNotifications.filter(n => n.read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Notificaciones</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} notificaciones sin leer` : 'Todas las notificaciones están al día'}
          </p>
        </div>
        
        <NotificationActions
          unreadCount={unreadCount}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearAllNotifications}
        />
      </div>

      {/* Filters */}
      <NotificationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
      />

      {/* Notifications */}
      <NotificationTabs
        unreadNotifications={unreadNotifications}
        readNotifications={readNotifications}
        filteredNotifications={filteredNotifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
};

export default NotificationCenter;

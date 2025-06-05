
import React, { useState } from 'react';
import { Bell, Filter, Search, Trash2, CheckCircle, AlertTriangle, Calendar, Heart, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'vaccine':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'health':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'breeding':
        return <Activity className="w-5 h-5 text-green-500" />;
      case 'weekly_report':
        return <Activity className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-600 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: Notification['priority']) => {
    const colors = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'secondary'
    } as const;
    
    return (
      <Badge variant={colors[priority]} className="text-xs">
        {priority === 'critical' ? 'Crítico' : 
         priority === 'high' ? 'Alto' :
         priority === 'medium' ? 'Medio' : 'Bajo'}
      </Badge>
    );
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'vaccine':
        return 'Vacuna';
      case 'health':
        return 'Salud';
      case 'breeding':
        return 'Reproducción';
      case 'weekly_report':
        return 'Reporte';
      default:
        return 'General';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.animalName?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    
    return matchesSearch && matchesPriority && matchesType;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.isRead);
  const readNotifications = filteredNotifications.filter(n => n.isRead);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <div
      className={`
        p-4 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-gray-50
        ${getPriorityColor(notification.priority)}
        ${notification.isRead ? 'opacity-60' : ''}
      `}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getNotificationIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-sm font-medium ${
                notification.isRead ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {notification.title}
              </h3>
              <div className="flex items-center space-x-2">
                {notification.priority === 'critical' && (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
                {getPriorityBadge(notification.priority)}
              </div>
            </div>
            
            <p className={`text-sm mb-2 ${
              notification.isRead ? 'text-gray-500' : 'text-gray-700'
            }`}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-xs">
                  {getTypeLabel(notification.type)}
                </Badge>
                
                {notification.animalName && (
                  <span className="text-xs text-blue-600">
                    {notification.animalName}
                  </span>
                )}
                
                {notification.actionRequired && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                    Acción requerida
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-400">
                {formatDistanceToNow(notification.createdAt, { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              className="h-8 w-8 p-0"
              title="Marcar como leído"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

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
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
          
          <Button 
            onClick={clearAllNotifications} 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar todo
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar notificaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="vaccine">Vacunas</SelectItem>
                <SelectItem value="health">Salud</SelectItem>
                <SelectItem value="breeding">Reproducción</SelectItem>
                <SelectItem value="weekly_report">Reportes</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="low">Bajo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
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
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¡Todo al día!
                </h3>
                <p className="text-gray-600">
                  No tienes notificaciones sin leer.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {unreadNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay notificaciones leídas
                </h3>
                <p className="text-gray-600">
                  Las notificaciones que marques como leídas aparecerán aquí.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {readNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Filter className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron notificaciones
                </h3>
                <p className="text-gray-600">
                  Intenta ajustar los filtros para ver más resultados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;


import React from 'react';
import { CheckCircle, Bell, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface NotificationEmptyStateProps {
  type: 'unread' | 'read' | 'filtered';
}

export const NotificationEmptyState = ({ type }: NotificationEmptyStateProps) => {
  if (type === 'unread') {
    return (
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
    );
  }

  if (type === 'read') {
    return (
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
    );
  }

  return (
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
  );
};

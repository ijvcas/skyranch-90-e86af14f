
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

const Calendar = () => {
  const navigate = useNavigate();

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Vacunación - Bella',
      date: '2024-06-05',
      type: 'vacuna',
      animalId: '001',
      description: 'Vacuna anual contra brucelosis'
    },
    {
      id: 2,
      title: 'Revisión Gestación - Luna',
      date: '2024-06-08',
      type: 'revision',
      animalId: '003',
      description: 'Control prenatal'
    },
    {
      id: 3,
      title: 'Pesaje General',
      date: '2024-06-12',
      type: 'pesaje',
      animalId: 'todos',
      description: 'Pesaje mensual de todos los animales'
    },
    {
      id: 4,
      title: 'Tratamiento - Max',
      date: '2024-06-15',
      type: 'tratamiento',
      animalId: '002',
      description: 'Continuación tratamiento antibiótico'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'vacuna':
        return 'bg-blue-100 text-blue-800';
      case 'revision':
        return 'bg-green-100 text-green-800';
      case 'pesaje':
        return 'bg-purple-100 text-purple-800';
      case 'tratamiento':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20 md:pb-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Panel
          </Button>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Calendario de Eventos
              </h1>
              <p className="text-gray-600">Próximas citas y recordatorios</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white mt-4 md:mt-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Esta semana</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">7</div>
              <div className="text-sm text-gray-600">Este mes</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-gray-600">Atrasados</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-gray-900">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 mb-2 md:mb-0">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      #{event.animalId}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  📅 {formatDate(event.date)}
                </div>
                
                <p className="text-sm text-gray-700">
                  {event.description}
                </p>
                
                <div className="flex space-x-2 mt-3">
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                  <Button size="sm" variant="outline">
                    Completar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Calendar View Placeholder */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Vista de Calendario</CardTitle>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Vista de calendario completa disponible próximamente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;

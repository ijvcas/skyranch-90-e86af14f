
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Calendar, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total de Animales', value: '4', color: 'bg-green-100 text-green-800' },
    { title: 'Registros de Salud', value: '4', color: 'bg-blue-100 text-blue-800' },
    { title: 'Próximas Citas', value: '2', color: 'bg-yellow-100 text-yellow-800' },
    { title: 'Usuarios Activos', value: '1', color: 'bg-purple-100 text-purple-800' },
  ];

  const quickActions = [
    { 
      title: 'Registrar Animal', 
      description: 'Añadir nuevo animal a la granja',
      icon: Plus,
      action: () => navigate('/animals/new'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    { 
      title: 'Ver Animales', 
      description: 'Gestionar animales existentes',
      icon: Users,
      action: () => navigate('/animals'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    { 
      title: 'Calendario', 
      description: 'Programar eventos y citas',
      icon: Calendar,
      action: () => navigate('/calendar'),
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    { 
      title: 'Configuración', 
      description: 'Ajustes del sistema',
      icon: Settings,
      action: () => navigate('/settings'),
      color: 'bg-gray-600 hover:bg-gray-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Panel de Control
          </h1>
          <p className="text-lg text-gray-600">SkyRanch - Gestiona tus animales, registros y más</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 md:p-6">
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${stat.color} mb-2`}>
                  {stat.title}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform active:scale-95">
              <CardHeader className="pb-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-lg ${action.color} flex items-center justify-center mb-4 shadow-md`}>
                  <action.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-base md:text-lg mb-6">{action.description}</p>
                <Button 
                  onClick={action.action}
                  className={`w-full h-12 text-base font-semibold ${action.color} text-white transition-colors duration-200`}
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

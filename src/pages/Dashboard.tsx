
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Calendar, Settings } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total de Animales', value: '24', color: 'bg-green-100 text-green-800' },
    { title: 'Registros de Salud', value: '15', color: 'bg-blue-100 text-blue-800' },
    { title: 'Próximas Citas', value: '3', color: 'bg-yellow-100 text-yellow-800' },
    { title: 'Usuarios Activos', value: '4', color: 'bg-purple-100 text-purple-800' },
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Control - Granja Familiar
          </h1>
          <p className="text-gray-600">Gestiona tus animales, registros y más</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stat.color} mb-2`}>
                  {stat.title}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                <Button 
                  onClick={action.action}
                  className={`w-full ${action.color} text-white transition-colors duration-200`}
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

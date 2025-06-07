
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Calendar, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Enhanced query with aggressive refetching to ensure data is always fresh
  const { data: allAnimals = [], isLoading, error, refetch } = useQuery({
    queryKey: ['animals', 'all-users'], // Changed key to be more specific
    queryFn: getAllAnimals,
    enabled: !!user,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  // Force a complete refresh of all data
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing all data...');
    queryClient.clear(); // Clear all cached data
    refetch();
    toast({
      title: "Actualizando datos",
      description: "Recargando todos los animales del sistema...",
    });
  };

  // Calculate all stats from the single query result
  const totalAnimals = allAnimals.length;
  const speciesCounts = allAnimals.reduce((counts, animal) => {
    counts[animal.species] = (counts[animal.species] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive"
      });
    }
  };

  const handleRetry = () => {
    refetch();
    toast({
      title: "Recargando datos",
      description: "Intentando cargar los animales nuevamente...",
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <div className="text-lg text-gray-600">Cargando datos de todos los usuarios...</div>
          <div className="text-sm text-gray-500 mt-2">Usuario actual: {user?.email}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-lg text-red-600 mb-4">Error al cargar datos</div>
          <div className="text-sm text-gray-600 mb-4">
            Usuario: {user?.email}
          </div>
          <div className="text-sm text-gray-600 mb-6">
            Hubo un problema al conectar con la base de datos. Esto puede deberse a problemas de permisos o configuración RLS.
          </div>
          <div className="space-y-2">
            <Button onClick={handleForceRefresh} className="bg-blue-600 hover:bg-blue-700 w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Forzar Actualización
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Recargar Página
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header with user info and logout */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Panel de Control
            </h1>
            <p className="text-lg text-gray-600">
              Bienvenido, {user?.email} - SkyRanch
            </p>
            <div className="text-sm text-gray-500 mt-1">
              Total de animales en el sistema: {totalAnimals}
            </div>
            {totalAnimals === 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">
                  No se encontraron animales. Si deberías ver animales, usa el botón "Forzar Actualización".
                </p>
                <Button 
                  onClick={handleForceRefresh} 
                  className="mt-2 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Forzar Actualización
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleForceRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-4 md:p-6">
              <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                Total de Animales
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalAnimals}</div>
            </CardContent>
          </Card>

          {/* Only show species with 1 or more animals */}
          {Object.entries(speciesCounts).map(([species, count]) => (
            <Card key={species} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-4 md:p-6">
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                  species === 'equino' ? 'bg-blue-100 text-blue-800' :
                  species === 'bovino' ? 'bg-yellow-100 text-yellow-800' :
                  species === 'ovino' ? 'bg-purple-100 text-purple-800' :
                  species === 'caprino' ? 'bg-red-100 text-red-800' :
                  species === 'porcino' ? 'bg-pink-100 text-pink-800' :
                  species === 'aviar' ? 'bg-orange-100 text-orange-800' :
                  species === 'canino' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {species === 'bovino' ? 'Bovinos' :
                   species === 'ovino' ? 'Ovinos' :
                   species === 'equino' ? 'Equinos' :
                   species === 'caprino' ? 'Caprinos' :
                   species === 'porcino' ? 'Porcinos' :
                   species === 'aviar' ? 'Aves' : 
                   species === 'canino' ? 'Caninos' :
                   species.charAt(0).toUpperCase() + species.slice(1)}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{count}</div>
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

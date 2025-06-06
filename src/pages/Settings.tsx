
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/userService';
import UserManagement from '@/components/UserManagement';
import PermissionsManager from '@/components/PermissionsManager';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import DataImportExport from '@/components/DataImportExport';
import AppInfoForm from '@/components/AppInfoForm';
import TimezoneSettings from '@/components/TimezoneSettings';

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Get current user data including role from database
  const { data: currentAppUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    enabled: !!user,
  });
  
  // Check if current user is an administrator based on database role
  const isAdmin = currentAppUser?.role === 'admin';

  console.log('Settings - user email:', user?.email); // Debug log
  console.log('Settings - currentAppUser:', currentAppUser); // Debug log
  console.log('Settings - isAdmin:', isAdmin); // Debug log

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4 pb-24">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Panel
          </Button>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configuración del Sistema
              </h1>
              <p className="text-gray-600">
                Administra usuarios, permisos, análisis y configuraciones generales
              </p>
              {/* Debug info for admin status */}
              {isAdmin && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Acceso de administrador activo (Rol: {currentAppUser?.role})
                </p>
              )}
              {currentAppUser && !isAdmin && (
                <p className="text-xs text-blue-600 mt-1">
                  Rol actual: {currentAppUser.role}
                </p>
              )}
            </div>

            {/* User Profile & Logout Section */}
            <Card className="min-w-72">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  Sesión Activa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <strong>Usuario:</strong> {user?.email}
                  {currentAppUser && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      currentAppUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                      currentAppUser.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {currentAppUser.role === 'admin' ? 'Administrador' :
                       currentAppUser.role === 'manager' ? 'Gerente' : 'Trabajador'}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* App Info Cards */}
          <div className="mb-8">
            <AppInfoForm isAdmin={isAdmin} />
          </div>

          {/* Timezone Settings */}
          <div className="mb-8">
            <TimezoneSettings />
          </div>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="analytics">Análisis Avanzado</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
            <TabsTrigger value="data">Datos</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <PermissionsManager />
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            <DataImportExport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

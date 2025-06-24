
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import AdminPasswordReset from '@/components/AdminPasswordReset';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminSettings = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Configuración de Administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Herramientas avanzadas para la administración del sistema y resolución de problemas de usuarios.
              </p>
            </CardContent>
          </Card>
          
          <AdminPasswordReset />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSettings;

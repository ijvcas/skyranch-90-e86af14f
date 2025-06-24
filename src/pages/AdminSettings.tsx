
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import AdminPasswordReset from '@/components/AdminPasswordReset';
import VersionControlPanel from '@/components/version-management/VersionControlPanel';
import VersionHistoryPanel from '@/components/version-management/VersionHistoryPanel';
import ProtectedRoute from '@/components/ProtectedRoute';

const AdminSettings = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Configuración de Administrador
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Herramientas avanzadas para la administración del sistema, control de versiones y resolución de problemas de usuarios.
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VersionControlPanel />
            <VersionHistoryPanel />
          </div>
          
          <AdminPasswordReset />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminSettings;


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import SupportInfoSettings from './SupportInfoSettings';
import DashboardBannerSettings from './DashboardBannerSettings';
import TimezoneSettings from '@/components/TimezoneSettings';
import DatabaseVersionDisplay from '@/components/app-info/DatabaseVersionDisplay';
import PermissionGuard from '@/components/PermissionGuard';

const SystemSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === 'jvcas@mac.com';

  const handleNavigateToLots = () => {
    navigate('/lots');
  };

  return (
    <div className="space-y-6">
      {/* Support Info Panel at the top */}
      <SupportInfoSettings isAdmin={isAdmin} />
      
      {/* Navigation Cards Section */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Gestión del Sistema</h3>
        
        {/* Lots Management Card */}
        <PermissionGuard permission="lots_manage" showError={false}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Gestión de Lotes y Parcelas
              </CardTitle>
              <CardDescription>
                Administra los lotes de la finca y visualiza las parcelas catastrales importadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleNavigateToLots}
                className="w-full justify-between"
                variant="outline"
              >
                <span>Ir a Gestión de Lotes</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </PermissionGuard>
      </div>
      
      {/* Dashboard Banner Settings */}
      <DashboardBannerSettings />
      
      {/* Timezone Settings */}
      <TimezoneSettings />
      
      {/* Database Version Display - manual version system with description field */}
      <DatabaseVersionDisplay />
    </div>
  );
};

export default SystemSettings;

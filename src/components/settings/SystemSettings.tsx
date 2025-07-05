
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink, Globe, Copy, Check } from 'lucide-react';
import SupportInfoSettings from './SupportInfoSettings';
import DashboardBannerSettings from './DashboardBannerSettings';
import TimezoneSettings from '@/components/TimezoneSettings';
import PermissionGuard from '@/components/PermissionGuard';
import VersionControlPanel from '@/components/version-management/VersionControlPanel';
import VersionHistoryPanel from '@/components/version-management/VersionHistoryPanel';
import { toast } from 'sonner';

const SystemSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === 'jvcas@mac.com';
  const [copied, setCopied] = useState(false);

  const handleNavigateToLots = () => {
    navigate('/lots');
  };

  const projectUrl = window.location.origin;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      setCopied(true);
      toast.success('URL copiada al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar la URL');
    }
  };

  return (
    <div className="space-y-6">
      {/* Support Info Panel at the top */}
      <SupportInfoSettings isAdmin={isAdmin} />
      
      {/* Project URL Card */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Información del Sistema</h3>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              URL del Proyecto
            </CardTitle>
            <CardDescription>
              URL en vivo del proyecto para compartir y acceso directo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-gray-50 rounded border">
              <code className="text-sm text-gray-700 break-all">{projectUrl}</code>
            </div>
            <Button 
              onClick={handleCopyUrl}
              className="w-full justify-between"
              variant="outline"
            >
              <span>Copiar URL</span>
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Dashboard Banner Settings */}
      <DashboardBannerSettings />
      
      {/* Timezone Settings */}
      <TimezoneSettings />
      
      {/* Version Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Gestión de Versiones</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VersionControlPanel />
          <VersionHistoryPanel />
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;

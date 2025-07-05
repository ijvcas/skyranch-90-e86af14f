
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Shield, Settings as SettingsIcon, Rocket } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface SettingsLayoutProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const SettingsLayout = ({ activeTab, onTabChange, children }: SettingsLayoutProps) => {
  const { checkPermission } = usePermissions();
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);

  useEffect(() => {
    const checkTabPermissions = async () => {
      const tabs = [];
      
      // Check permissions for each tab
      if (await checkPermission('users_manage')) {
        tabs.push('users');
      }
      if (await checkPermission('system_settings')) {
        tabs.push('backup', 'permissions', 'versions', 'system');
      }
      
      setAvailableTabs(tabs);
      
      // If current active tab is not available, switch to first available
      if (tabs.length > 0 && !tabs.includes(activeTab)) {
        onTabChange(tabs[0]);
      }
    };

    checkTabPermissions();
  }, [checkPermission, activeTab, onTabChange]);

  return (
    <div className="page-with-logo">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Configuración del Sistema
          </h1>
          <p className="text-gray-500">Administración completa del sistema y configuraciones</p>
        </div>

        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="flex flex-col w-full md:grid md:grid-cols-5 md:h-10">
            {availableTabs.includes('users') && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuarios
              </TabsTrigger>
            )}
            {availableTabs.includes('backup') && (
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Backup
              </TabsTrigger>
            )}
            {availableTabs.includes('permissions') && (
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Permisos
              </TabsTrigger>
            )}
            {availableTabs.includes('versions') && (
              <TabsTrigger value="versions" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Versiones
              </TabsTrigger>
            )}
            {availableTabs.includes('system') && (
              <TabsTrigger value="system" className="flex items-center gap-2">
                <SettingsIcon className="w-4 h-4" />
                Sistema
              </TabsTrigger>
            )}
          </TabsList>

          {children}
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsLayout;

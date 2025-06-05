
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Users, Bell, Info, Database } from 'lucide-react';
import { clearAllAnimals, getAllAnimals, restoreAnimalsFromBackup, getBackupInfo } from '@/stores/animalStore';
import { useToast } from '@/hooks/use-toast';
import { useTimezone } from '@/hooks/useTimezone';
import UserManagement from '@/components/UserManagement';
import DataImportExport from '@/components/DataImportExport';

interface AppSettings {
  notifications: {
    vaccineReminders: boolean;
    healthAlerts: boolean;
    weeklyReports: boolean;
  };
  system: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { timezone, setTimezone } = useTimezone();
  const [showUserManagement, setShowUserManagement] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    notifications: {
      vaccineReminders: true,
      healthAlerts: true,
      weeklyReports: false,
    },
    system: {
      language: 'es',
      timezone: timezone,
      dateFormat: 'DD/MM/YYYY',
    },
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...parsed,
          system: {
            ...parsed.system,
            timezone: timezone // Use timezone from hook
          }
        }));
        console.log('Loaded settings from storage:', parsed);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, [timezone]);

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
    console.log('Settings saved to storage:', newSettings);
  };

  const timezones = [
    { value: 'America/Lima', label: 'UTC-5 (América/Lima)' },
    { value: 'America/Mexico_City', label: 'UTC-6 (América/Ciudad de México)' },
    { value: 'America/New_York', label: 'UTC-5 (América/Nueva York)' },
    { value: 'America/Los_Angeles', label: 'UTC-8 (América/Los Ángeles)' },
    { value: 'Europe/Madrid', label: 'UTC+1 (Europa/Madrid)' },
    { value: 'Europe/London', label: 'UTC+0 (Europa/Londres)' },
    { value: 'Asia/Tokyo', label: 'UTC+9 (Asia/Tokio)' },
    { value: 'Australia/Sydney', label: 'UTC+10 (Australia/Sídney)' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'fr', label: 'Français' },
  ];

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/AAAA (31/12/2024)' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/AAAA (12/31/2024)' },
    { value: 'YYYY-MM-DD', label: 'AAAA-MM-DD (2024-12-31)' },
    { value: 'DD-MM-YYYY', label: 'DD-MM-AAAA (31-12-2024)' },
  ];

  const handleNotificationToggle = (key: keyof AppSettings['notifications']) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    };
    saveSettings(newSettings);
    
    const notificationLabels = {
      vaccineReminders: 'Recordatorios de Vacunas',
      healthAlerts: 'Alertas de Salud',
      weeklyReports: 'Reportes Semanales'
    };
    
    toast({
      title: "Notificación Actualizada",
      description: `${notificationLabels[key]} ${newSettings.notifications[key] ? 'activado' : 'desactivado'}`,
    });
  };

  const handleSystemSetting = (key: keyof AppSettings['system'], value: string) => {
    const newSettings = {
      ...settings,
      system: {
        ...settings.system,
        [key]: value
      }
    };
    
    // Special handling for timezone
    if (key === 'timezone') {
      setTimezone(value);
    }
    
    saveSettings(newSettings);
    
    const settingLabels = {
      language: 'Idioma',
      timezone: 'Zona Horaria',
      dateFormat: 'Formato de Fecha'
    };
    
    toast({
      title: "Configuración Actualizada",
      description: `${settingLabels[key]} actualizado correctamente`,
    });
  };

  const handleDebugStore = () => {
    const animals = getAllAnimals();
    console.log('🔍 Debug Store Info:');
    console.log('📊 Total animals:', animals.length);
    console.log('🐄 Animals data:', animals);
    console.log('💾 LocalStorage size:', JSON.stringify(localStorage).length, 'bytes');
    console.log('🗄️ All localStorage keys:', Object.keys(localStorage));
    console.log('🕒 Current timezone:', timezone);
    
    toast({
      title: "Debug Info",
      description: `Store has ${animals.length} animals. Check console for details.`,
    });
  };

  const handleClearData = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos de animales? Esta acción no se puede deshacer.')) {
      clearAllAnimals();
      toast({
        title: "Datos Eliminados",
        description: "Todos los datos de animales han sido eliminados.",
        variant: "destructive"
      });
    }
  };

  const handleSyncData = () => {
    // Simulate sync operation
    toast({
      title: "Sincronización Iniciada",
      description: "Sincronizando datos con el servidor...",
    });
    
    setTimeout(() => {
      toast({
        title: "Sincronización Completa",
        description: "Todos los datos han sido sincronizados correctamente.",
      });
    }, 2000);
  };

  const handleTechnicalSupport = () => {
    toast({
      title: "Soporte Técnico",
      description: "Contacto: soporte@granja.com | Tel: +1-800-GRANJA",
    });
  };

  const handleAbout = () => {
    toast({
      title: "Acerca del Sistema",
      description: "Sistema de Gestión Ganadera v1.0.0 - Desarrollado con ❤️",
    });
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      // Clear any user session data if needed
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión exitosamente",
        variant: "destructive"
      });
      // In a real app, you would redirect to login
      navigate('/');
    }
  };

  const notificationSettings = [
    { 
      label: 'Recordatorios de Vacunas', 
      description: 'Alertas automáticas', 
      key: 'vaccineReminders' as const,
      checked: settings.notifications.vaccineReminders
    },
    { 
      label: 'Alertas de Salud', 
      description: 'Notificaciones de estado crítico', 
      key: 'healthAlerts' as const,
      checked: settings.notifications.healthAlerts
    },
    { 
      label: 'Reportes Semanales', 
      description: 'Resumen automático por email', 
      key: 'weeklyReports' as const,
      checked: settings.notifications.weeklyReports
    },
  ];

  const systemSettings = [
    { 
      label: 'Idioma', 
      description: 'Selecciona el idioma de la aplicación',
      key: 'language' as const,
      value: settings.system.language,
      options: languages
    },
    { 
      label: 'Zona Horaria', 
      description: 'Selecciona tu zona horaria',
      key: 'timezone' as const,
      value: settings.system.timezone,
      options: timezones
    },
    { 
      label: 'Formato de Fecha', 
      description: 'Formato de visualización de fechas',
      key: 'dateFormat' as const,
      value: settings.system.dateFormat,
      options: dateFormats
    },
  ];

  const dataSettings = [
    { 
      label: 'Debug Store', 
      description: 'Verificar estado del almacén de datos',
      action: handleDebugStore
    },
    { 
      label: 'Sincronizar Datos', 
      description: 'Sincronizar con el servidor',
      action: handleSyncData
    },
    { 
      label: 'Limpiar Datos', 
      description: 'Eliminar todos los datos de animales',
      action: handleClearData,
      isDestructive: true
    },
  ];

  const infoSettings = [
    { 
      label: 'Versión de la App', 
      description: 'v1.0.0 - Última actualización: Hoy',
      action: handleAbout
    },
    { 
      label: 'Última Sincronización', 
      description: new Date().toLocaleString('es-ES'),
      action: handleSyncData
    },
    { 
      label: 'Espacio Utilizado', 
      description: `${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB de datos locales`,
      action: handleDebugStore
    },
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración
          </h1>
          <p className="text-gray-600">Ajusta las preferencias del sistema</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="data">Datos</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <SettingsIcon className="w-5 h-5 mr-3" />
                  Configuración del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemSettings.map((setting, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <div className="min-w-[200px]">
                      <Select 
                        value={setting.value} 
                        onValueChange={(value) => handleSystemSetting(setting.key, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Selecciona ${setting.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Users className="w-5 h-5 mr-3" />
                  Gestión de Usuarios y Permisos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Database className="w-5 h-5 mr-3" />
                  Gestión de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataImportExport />
                
                <div className="mt-8 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Herramientas Avanzadas</h3>
                  <div className="space-y-4">
                    {dataSettings.map((setting, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{setting.label}</div>
                          <div className="text-sm text-gray-600">{setting.description}</div>
                        </div>
                        <Button 
                          variant={setting.isDestructive ? "destructive" : "default"} 
                          size="sm"
                          onClick={setting.action}
                        >
                          {setting.isDestructive ? "Eliminar" : "Ejecutar"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Bell className="w-5 h-5 mr-3" />
                  Configuración de Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map((setting, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id={`setting-${index}`} 
                        checked={setting.checked}
                        onCheckedChange={() => handleNotificationToggle(setting.key)}
                      />
                      <Label htmlFor={`setting-${index}`} className="sr-only">
                        {setting.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Info className="w-5 h-5 mr-3" />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {infoSettings.map((setting, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={setting.action}>
                      Ver
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* App Info */}
            <Card className="shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sistema de Gestión Ganadera
                </h3>
                <p className="text-gray-600 mb-4">
                  Desarrollado para granjas familiares con amor y tecnología
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" size="sm" onClick={handleTechnicalSupport}>
                    Soporte Técnico
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleAbout}>
                    Acerca de
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

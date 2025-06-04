
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Users, Bell, Info } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [selectedTimezone, setSelectedTimezone] = useState('America/Lima');

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

  const settingsSections = [
    {
      title: 'Usuarios y Permisos',
      icon: Users,
      items: [
        { label: 'Gestionar Usuarios', description: 'Añadir o eliminar usuarios de la granja' },
        { label: 'Roles y Permisos', description: 'Configurar niveles de acceso' },
      ]
    },
    {
      title: 'Notificaciones',
      icon: Bell,
      items: [
        { label: 'Recordatorios de Vacunas', description: 'Alertas automáticas', hasSwitch: true },
        { label: 'Alertas de Salud', description: 'Notificaciones de estado crítico', hasSwitch: true },
        { label: 'Reportes Semanales', description: 'Resumen automático por email', hasSwitch: true },
      ]
    },
    {
      title: 'Sistema',
      icon: SettingsIcon,
      items: [
        { label: 'Idioma', description: 'Español (predeterminado)' },
        { 
          label: 'Zona Horaria', 
          description: 'Selecciona tu zona horaria',
          hasTimezone: true 
        },
        { label: 'Formato de Fecha', description: 'DD/MM/AAAA' },
      ]
    },
    {
      title: 'Información',
      icon: Info,
      items: [
        { label: 'Versión de la App', description: 'v1.0.0' },
        { label: 'Última Sincronización', description: 'Hace 5 minutos' },
        { label: 'Espacio Utilizado', description: '2.3 GB de 10 GB' },
      ]
    }
  ];

  const handleTimezoneChange = (value: string) => {
    setSelectedTimezone(value);
    // Here you could save to localStorage or send to backend
    localStorage.setItem('selectedTimezone', value);
  };

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

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <section.icon className="w-5 h-5 mr-3" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                    {item.hasSwitch ? (
                      <div className="flex items-center space-x-2">
                        <Switch id={`setting-${index}-${itemIndex}`} />
                        <Label htmlFor={`setting-${index}-${itemIndex}`} className="sr-only">
                          {item.label}
                        </Label>
                      </div>
                    ) : item.hasTimezone ? (
                      <div className="min-w-[200px]">
                        <Select value={selectedTimezone} onValueChange={handleTimezoneChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona zona horaria" />
                          </SelectTrigger>
                          <SelectContent>
                            {timezones.map((timezone) => (
                              <SelectItem key={timezone.value} value={timezone.value}>
                                {timezone.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm">
                        Configurar
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* App Info */}
        <Card className="shadow-lg mt-8">
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
              <Button variant="outline" size="sm">
                Soporte Técnico
              </Button>
              <Button variant="outline" size="sm">
                Acerca de
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

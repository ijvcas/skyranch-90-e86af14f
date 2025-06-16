
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Smartphone, Globe, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DatabaseVersionDisplay from '@/components/app-info/DatabaseVersionDisplay';
import AuthenticationStatusCard from '@/components/lots/AuthenticationStatusCard';
import TimezoneSettings from '@/components/TimezoneSettings';
import GmailOAuthTestButton from '@/components/calendar/GmailOAuthTestButton';

const SystemSettings = () => {
  const { toast } = useToast();

  const testGmailIntegration = async () => {
    try {
      toast({
        title: "🧪 Probando Gmail API...",
        description: "Enviando email de prueba via Gmail API",
      });

      const { data, error } = await supabase.functions.invoke('send-gmail', {
        body: {
          to: 'jvcas@mac.com',
          subject: '🧪 Test Gmail API Integration - SkyRanch',
          html: `
            <h1>✅ Gmail API Integration Test</h1>
            <p>This is a test email sent via Gmail API from SkyRanch.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>System:</strong> SkyRanch - Sistema de Gestión Ganadera</p>
            <hr>
            <p><em>Si recibes este email, la integración con Gmail API está funcionando correctamente.</em></p>
          `,
          senderName: "SkyRanch - Gmail Test",
          organizationName: "SkyRanch"
        }
      });

      if (error) {
        console.error('Gmail test error:', error);
        toast({
          title: "❌ Error en Gmail API",
          description: `Error: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "✅ Gmail API Funcionando",
          description: `Email enviado exitosamente. Message ID: ${data.messageId}`,
        });
      } else {
        toast({
          title: "❌ Error en Gmail API",
          description: data?.message || "Error desconocido",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Gmail test error:', error);
      toast({
        title: "❌ Error en Gmail API",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <TabsContent value="system" className="space-y-6">
      <div className="space-y-6">
        {/* Database-backed Version Management */}
        <DatabaseVersionDisplay />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <AuthenticationStatusCard />
          
          {/* Gmail Integration Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Gmail API Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estado:</span>
                <span className="text-sm text-green-600 font-medium">✓ Configurado</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transporte:</span>
                <span className="text-sm text-blue-600 font-medium">Gmail API</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Función Edge:</span>
                <span className="text-sm text-green-600 font-medium">send-gmail</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Email de Prueba:</span>
                <p className="text-xs font-mono text-gray-500">
                  jvcas@mac.com
                </p>
              </div>
              
              <Button 
                onClick={testGmailIntegration}
                className="w-full"
                variant="outline"
              >
                🧪 Probar Envío Gmail
              </Button>
            </CardContent>
          </Card>

          {/* Gmail OAuth Testing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Gmail OAuth Testing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Método:</span>
                <span className="text-sm text-blue-600 font-medium">OAuth 2.0</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cuenta:</span>
                <span className="text-sm text-gray-500 font-medium">Personal Gmail</span>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Descripción:</span>
                <p className="text-xs text-gray-500">
                  Envía emails usando tu cuenta personal de Gmail con autenticación OAuth
                </p>
              </div>
              
              <div className="pt-2">
                <GmailOAuthTestButton />
              </div>
            </CardContent>
          </Card>
          
          {/* Timezone Settings */}
          <TimezoneSettings />
          
          {/* Project URL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                URL del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <span className="text-sm text-gray-600">URL Principal:</span>
                <p className="text-xs font-mono text-blue-600 break-all p-2 bg-gray-50 rounded border">
                  {window.location.origin}
                </p>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Ruta Actual:</span>
                <p className="text-xs font-mono text-gray-500 break-all">
                  {window.location.pathname}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Protocolo:</span>
                <span className="text-sm text-green-600 font-medium">
                  {window.location.protocol === 'https:' ? '🔒 HTTPS' : '⚠️ HTTP'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Puerto:</span>
                <span className="text-sm text-gray-500 font-medium">
                  {window.location.port || (window.location.protocol === 'https:' ? '443' : '80')}
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Platform Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Estado de Plataformas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Plataforma Web:</span>
                <span className="text-sm text-green-600 font-medium">✓ Activa</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Aplicación Móvil:</span>
                <span className="text-sm text-green-600 font-medium">✓ Disponible</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Capacitor:</span>
                <span className="text-sm text-blue-600 font-medium">v7.2.0</span>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-gray-600">App ID:</span>
                <p className="text-xs font-mono text-gray-500">
                  app.lovable.4851015cb1c043d19c9f6d125b0fd71b
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Estado de la Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supabase:</span>
                <span className="text-sm text-green-600 font-medium">✓ Conectado</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Proyecto:</span>
                <span className="text-xs font-mono text-gray-500">ahwhtxygyzoadsmdrwwg</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RLS Activo:</span>
                <span className="text-sm text-green-600 font-medium">✓ Habilitado</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tablas Principales:</span>
                <span className="text-sm text-blue-600 font-medium">animals, lots, polygons</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default SystemSettings;

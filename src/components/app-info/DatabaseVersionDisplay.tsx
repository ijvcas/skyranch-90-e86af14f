
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Rocket, GitBranch, Clock, Plus, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databaseVersionService, type DatabaseVersion } from '@/services/databaseVersionService';

const DatabaseVersionDisplay = () => {
  const { toast } = useToast();
  const [currentVersion, setCurrentVersion] = useState<DatabaseVersion | null>(null);
  const [versionHistory, setVersionHistory] = useState<DatabaseVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [incrementing, setIncrementing] = useState(false);
  const [notes, setNotes] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadCurrentVersion();
    loadVersionHistory();

    // Subscribe to version changes
    const unsubscribe = databaseVersionService.subscribeToVersionChanges((newVersion) => {
      setCurrentVersion(newVersion);
      loadVersionHistory();
      toast({
        title: "Nueva versión disponible",
        description: `Versión ${newVersion.version} - Build #${newVersion.build_number}`,
      });
    });

    return unsubscribe;
  }, []);

  const loadCurrentVersion = async () => {
    setLoading(true);
    const version = await databaseVersionService.getCurrentVersion();
    setCurrentVersion(version);
    setLoading(false);
  };

  const loadVersionHistory = async () => {
    const history = await databaseVersionService.getVersionHistory();
    setVersionHistory(history);
  };

  const handleIncrementVersion = async () => {
    setIncrementing(true);
    const newVersion = await databaseVersionService.incrementVersion(notes || 'Nueva versión publicada');
    
    if (newVersion) {
      setCurrentVersion(newVersion);
      setNotes('');
      await loadVersionHistory();
      toast({
        title: "Versión incrementada exitosamente",
        description: `Nueva versión: v${newVersion.version} - Build #${newVersion.build_number}`,
      });
    } else {
      toast({
        title: "Error al incrementar versión",
        description: "No se pudo incrementar la versión. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
    setIncrementing(false);
  };

  const handleRefresh = async () => {
    await loadCurrentVersion();
    await loadVersionHistory();
    toast({
      title: "Información actualizada",
      description: "Se ha recargado la información de versión actual.",
    });
  };

  if (loading && !currentVersion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Control de Versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando información de versiones...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentVersion) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Control de Versiones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No se pudo cargar la información de versiones.</p>
          <Button onClick={handleRefresh} className="mt-2">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Rocket className="w-5 h-5 mr-2" />
              Control de Versiones
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                {showHistory ? 'Ocultar' : 'Historial'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Versión Actual:</span>
            <Badge variant="outline" className="font-mono text-lg">
              v{currentVersion.version}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Número de Build:</span>
            <Badge variant="secondary">
              #{currentVersion.build_number}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Última Actualización:</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              {new Date(currentVersion.created_at).toLocaleString('es-ES')}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <GitBranch className="w-4 h-4 mr-2" />
              <span>Notas:</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              {currentVersion.notes || 'Sin notas'}
            </p>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Publicar Nueva Versión
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="version-notes">Notas de la versión (opcional)</Label>
              <Input
                id="version-notes"
                placeholder="Ej: Corrección de errores, nuevas funcionalidades..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleIncrementVersion}
              disabled={incrementing}
              className="w-full"
            >
              {incrementing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Publicar Nueva Versión
                </>
              )}
            </Button>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Instrucciones:</strong> Después de hacer "Publish Update" en Lovable, 
              usa el botón "Publicar Nueva Versión" para incrementar automáticamente la versión 
              del sistema.
            </p>
          </div>
        </CardContent>
      </Card>

      {showHistory && versionHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Historial de Versiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {versionHistory.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={version.is_current ? "default" : "secondary"}>
                        v{version.version}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Build #{version.build_number}
                      </span>
                      {version.is_current && (
                        <Badge variant="outline" className="text-xs">
                          Actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {version.notes || 'Sin notas'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(version.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DatabaseVersionDisplay;

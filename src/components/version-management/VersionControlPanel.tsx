
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Plus, RefreshCw } from 'lucide-react';
import { unifiedVersionManager, type UnifiedVersionInfo } from '@/services/version-management';
import VersionInfoDisplay from './components/VersionInfoDisplay';
import VersionPublishForm from './components/VersionPublishForm';

const VersionControlPanel = () => {
  const [currentVersion, setCurrentVersion] = useState<UnifiedVersionInfo | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCurrentVersion = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading current version from database...');
      const version = await unifiedVersionManager.getCurrentVersion();
      setCurrentVersion(version);
      console.log('✅ Current version loaded:', version);
    } catch (error) {
      console.error('❌ Error loading current version:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentVersion();

    const handleVersionUpdate = (event: CustomEvent) => {
      console.log('🔄 Version update event received:', event.detail);
      setCurrentVersion(event.detail);
    };

    window.addEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Force refreshing version data...');
      // Force refresh from database manager
      const freshVersion = await unifiedVersionManager.databaseManager?.forceRefresh();
      if (freshVersion) {
        setCurrentVersion(freshVersion);
      }
      await loadCurrentVersion();
    } catch (error) {
      console.error('❌ Error force refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePublishSuccess = () => {
    setShowPublishForm(false);
  };

  const handlePublishCancel = () => {
    setShowPublishForm(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <p className="text-gray-500">Cargando información de versiones desde la base de datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentVersion) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <p className="text-red-500">Error: No se pudo cargar la información de versiones de la base de datos.</p>
            <Button onClick={handleForceRefresh} disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Control de Versiones Unificado (Base de Datos)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForceRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPublishForm(!showPublishForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {showPublishForm ? 'Cancelar' : 'Publicar Versión'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VersionInfoDisplay currentVersion={currentVersion} />

        {showPublishForm && (
          <VersionPublishForm 
            onSuccess={handlePublishSuccess}
            onCancel={handlePublishCancel}
          />
        )}

        <div className="bg-green-50 p-3 rounded-lg mt-6">
          <p className="text-sm text-green-800">
            <strong>Sistema Integrado con Base de Datos:</strong> Este panel ahora se sincroniza 
            directamente con la base de datos. Las versiones se mantienen persistentes y no se 
            resetean automáticamente.
          </p>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-50 p-3 rounded-lg mt-4">
          <p className="text-xs text-gray-600">
            <strong>Debug:</strong> Versión actual v{currentVersion.version} - Build #{currentVersion.buildNumber} | 
            Fuente: Base de datos | Última actualización: {new Date(currentVersion.releaseDate).toLocaleString('es-ES')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionControlPanel;

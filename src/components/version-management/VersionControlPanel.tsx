
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Plus } from 'lucide-react';
import { unifiedVersionManager, type UnifiedVersionInfo } from '@/services/version-management';
import VersionInfoDisplay from './components/VersionInfoDisplay';
import VersionPublishForm from './components/VersionPublishForm';

const VersionControlPanel = () => {
  const [currentVersion, setCurrentVersion] = useState<UnifiedVersionInfo | null>(null);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCurrentVersion = async () => {
      try {
        setIsLoading(true);
        const version = await unifiedVersionManager.getCurrentVersion();
        setCurrentVersion(version);
        console.log('🔄 Loaded current version:', version);
      } catch (error) {
        console.error('Error loading current version:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentVersion();

    const handleVersionUpdate = (event: CustomEvent) => {
      setCurrentVersion(event.detail);
      console.log('🔄 Version updated via event:', event.detail);
    };

    window.addEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('unified-version-updated', handleVersionUpdate as EventListener);
    };
  }, []);

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
          <p className="text-gray-500">Cargando información de versiones desde la base de datos...</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentVersion) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-500">Error: No se pudo cargar la información de versiones de la base de datos.</p>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPublishForm(!showPublishForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showPublishForm ? 'Cancelar' : 'Publicar Versión'}
          </Button>
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
      </CardContent>
    </Card>
  );
};

export default VersionControlPanel;

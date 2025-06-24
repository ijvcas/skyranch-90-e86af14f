
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

  useEffect(() => {
    const loadCurrentVersion = () => {
      const version = unifiedVersionManager.getCurrentVersion();
      setCurrentVersion(version);
    };

    loadCurrentVersion();

    const handleVersionUpdate = (event: CustomEvent) => {
      setCurrentVersion(event.detail);
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

  if (!currentVersion) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Cargando información de versiones...</p>
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
            Control de Versiones Unificado
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

        <div className="bg-amber-50 p-3 rounded-lg mt-6">
          <p className="text-sm text-amber-800">
            <strong>Sistema Unificado:</strong> Este panel controla todas las versiones del sistema. 
            Los incrementos siguen la convención semántica: MAJOR.MINOR.PATCH.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionControlPanel;

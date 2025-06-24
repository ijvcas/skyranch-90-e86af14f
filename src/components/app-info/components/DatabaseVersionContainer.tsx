
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databaseVersionService, type DatabaseVersion } from '@/services/databaseVersionService';
import VersionInfoCard from './VersionInfoCard';
import VersionPublishForm from './VersionPublishForm';
import VersionHistoryCard from './VersionHistoryCard';

const DatabaseVersionContainer = () => {
  const { toast } = useToast();
  const [currentVersion, setCurrentVersion] = useState<DatabaseVersion | null>(null);
  const [versionHistory, setVersionHistory] = useState<DatabaseVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [incrementing, setIncrementing] = useState(false);
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

  const handleIncrementVersion = async (notes: string) => {
    setIncrementing(true);
    const newVersion = await databaseVersionService.incrementVersion(notes || 'Nueva versión publicada');
    
    if (newVersion) {
      setCurrentVersion(newVersion);
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
      <div className="space-y-6">
        <p className="text-gray-500">Cargando información de versiones...</p>
      </div>
    );
  }

  if (!currentVersion) {
    return (
      <div className="space-y-6">
        <p className="text-gray-500">No se pudo cargar la información de versiones.</p>
        <Button onClick={handleRefresh}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Control de Versiones</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Ocultar' : 'Historial'}
        </Button>
      </div>

      <VersionInfoCard 
        currentVersion={currentVersion} 
        onRefresh={handleRefresh} 
      />
      
      <VersionPublishForm 
        onPublish={handleIncrementVersion}
        isPublishing={incrementing}
      />

      <VersionHistoryCard 
        versionHistory={versionHistory}
        showHistory={showHistory}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />
    </div>
  );
};

export default DatabaseVersionContainer;

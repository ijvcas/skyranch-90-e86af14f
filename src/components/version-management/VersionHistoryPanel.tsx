
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RefreshCw } from 'lucide-react';
import { unifiedVersionManager, type VersionHistory } from '@/services/version-management';
import CompactVersionHistoryItem from './CompactVersionHistoryItem';

const VersionHistoryPanel = () => {
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      console.log('📚 Loading version history from database...');
      const history = await unifiedVersionManager.getVersionHistory();
      setVersionHistory(history);
      console.log('📚 Version history loaded:', history);
    } catch (error) {
      console.error('❌ Error loading version history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleVersionUpdate = async () => {
      console.log('🔄 Version updated, refreshing history...');
      await loadHistory();
    };

    window.addEventListener('unified-version-updated', handleVersionUpdate);
    
    return () => {
      window.removeEventListener('unified-version-updated', handleVersionUpdate);
    };
  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de Versiones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-gray-500 text-center py-4">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <p>Cargando historial desde la base de datos...</p>
          </div>
        ) : versionHistory.length === 0 ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-4">
              No hay historial de versiones disponible en la base de datos.
            </p>
            <Button onClick={loadHistory} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar desde Base de Datos
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {versionHistory.map((version) => (
              <CompactVersionHistoryItem key={version.id} version={version} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionHistoryPanel;

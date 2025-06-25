
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RefreshCw } from 'lucide-react';
import { unifiedVersionManager, type VersionHistory } from '@/services/version-management';
import VersionHistoryItem from './components/VersionHistoryItem';

const VersionHistoryPanel = () => {
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleForceRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Force refreshing version history...');
      await loadHistory();
    } catch (error) {
      console.error('❌ Error force refreshing history:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayedHistory = showAll ? versionHistory : versionHistory.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Historial de Versiones (Base de Datos)
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
            {versionHistory.length > 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Mostrar Menos' : `Ver Todas (${versionHistory.length})`}
              </Button>
            )}
          </div>
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
            <Button onClick={handleForceRefresh} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recargar desde Base de Datos
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {displayedHistory.map((version) => (
                <VersionHistoryItem key={version.id} version={version} />
              ))}
            </div>
            
            {/* Debug Info */}
            <div className="bg-gray-50 p-3 rounded-lg mt-4">
              <p className="text-xs text-gray-600">
                <strong>Debug:</strong> Mostrando {displayedHistory.length} de {versionHistory.length} versiones | 
                Fuente: Base de datos | Última carga: {new Date().toLocaleString('es-ES')}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionHistoryPanel;

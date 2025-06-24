
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import { unifiedVersionManager, type VersionHistory } from '@/services/version-management';
import VersionHistoryItem from './components/VersionHistoryItem';

const VersionHistoryPanel = () => {
  const [versionHistory, setVersionHistory] = useState<VersionHistory[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const loadHistory = () => {
      const history = unifiedVersionManager.getVersionHistory();
      setVersionHistory(history);
    };

    loadHistory();

    const handleVersionUpdate = () => {
      loadHistory();
    };

    window.addEventListener('unified-version-updated', handleVersionUpdate);
    
    return () => {
      window.removeEventListener('unified-version-updated', handleVersionUpdate);
    };
  }, []);

  const displayedHistory = showAll ? versionHistory : versionHistory.slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Historial de Versiones
          </div>
          {versionHistory.length > 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Mostrar Menos' : `Ver Todas (${versionHistory.length})`}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {versionHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay historial de versiones disponible.
          </p>
        ) : (
          <div className="space-y-4">
            {displayedHistory.map((version) => (
              <VersionHistoryItem key={version.id} version={version} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionHistoryPanel;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Calendar, GitBranch, User, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import { unifiedVersionManager, type VersionHistory } from '@/services/version-management';

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

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800 border-red-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVersionTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return <AlertCircle className="w-3 h-3" />;
      case 'minor': return <Plus className="w-3 h-3" />;
      case 'patch': return <CheckCircle className="w-3 h-3" />;
      default: return <GitBranch className="w-3 h-3" />;
    }
  };

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
              <div 
                key={version.id} 
                className={`p-4 border rounded-lg ${version.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={version.isCurrent ? "default" : "secondary"}
                      className="font-mono"
                    >
                      v{version.version}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={getVersionTypeColor(version.versionType)}
                    >
                      <div className="flex items-center gap-1">
                        {getVersionTypeIcon(version.versionType)}
                        {version.versionType.toUpperCase()}
                      </div>
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Build #{version.buildNumber}
                    </span>
                    {version.isCurrent && (
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                        Actual
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {version.notes}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(version.releaseDate).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {version.publishedBy || 'Sistema'}
                    </div>
                  </div>
                  <span className="text-xs">
                    {new Date(version.releaseDate).toLocaleTimeString('es-ES')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VersionHistoryPanel;

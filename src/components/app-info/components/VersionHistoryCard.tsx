
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import type { DatabaseVersion } from '@/services/databaseVersionService';

interface VersionHistoryCardProps {
  versionHistory: DatabaseVersion[];
  showHistory: boolean;
  onToggleHistory: () => void;
}

const VersionHistoryCard: React.FC<VersionHistoryCardProps> = ({ 
  versionHistory, 
  showHistory, 
  onToggleHistory 
}) => {
  if (!showHistory || versionHistory.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <History className="w-5 h-5 mr-2" />
            Historial de Versiones
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHistory}
          >
            Ocultar
          </Button>
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
  );
};

export default VersionHistoryCard;

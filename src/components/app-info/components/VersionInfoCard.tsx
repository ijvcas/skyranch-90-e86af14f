
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, RefreshCw, Clock, GitBranch } from 'lucide-react';
import type { DatabaseVersion } from '@/services/databaseVersionService';

interface VersionInfoCardProps {
  currentVersion: DatabaseVersion;
  onRefresh: () => void;
}

const VersionInfoCard: React.FC<VersionInfoCardProps> = ({ currentVersion, onRefresh }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            Información de Versión Actual
          </div>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1 text-sm border rounded hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
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
      </CardContent>
    </Card>
  );
};

export default VersionInfoCard;

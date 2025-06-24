
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, GitBranch, AlertCircle, Plus, CheckCircle } from 'lucide-react';
import type { UnifiedVersionInfo } from '@/services/version-management';

interface VersionInfoDisplayProps {
  currentVersion: UnifiedVersionInfo;
}

const VersionInfoDisplay: React.FC<VersionInfoDisplayProps> = ({ currentVersion }) => {
  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-red-100 text-red-800';
      case 'minor': return 'bg-blue-100 text-blue-800';
      case 'patch': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionTypeIcon = (type: string) => {
    switch (type) {
      case 'major': return <AlertCircle className="w-4 h-4" />;
      case 'minor': return <Plus className="w-4 h-4" />;
      case 'patch': return <CheckCircle className="w-4 h-4" />;
      default: return <GitBranch className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Versión Actual:</span>
        <Badge variant="outline" className="font-mono text-lg">
          v{currentVersion.version}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Número de Build:</span>
        <Badge variant="secondary">
          #{currentVersion.buildNumber}
        </Badge>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Tipo de Versión:</span>
        <Badge className={getVersionTypeColor(currentVersion.versionType)}>
          <div className="flex items-center gap-1">
            {getVersionTypeIcon(currentVersion.versionType)}
            {currentVersion.versionType.toUpperCase()}
          </div>
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>Fecha de Publicación:</span>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          {new Date(currentVersion.releaseDate).toLocaleString('es-ES')}
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <GitBranch className="w-4 h-4 mr-2" />
          <span>Notas de la Versión:</span>
        </div>
        <p className="text-xs text-gray-500 ml-6">
          {currentVersion.notes}
        </p>
      </div>

      {currentVersion.publishedBy && (
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span>Publicado por:</span>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            {currentVersion.publishedBy}
          </p>
        </div>
      )}
    </div>
  );
};

export default VersionInfoDisplay;

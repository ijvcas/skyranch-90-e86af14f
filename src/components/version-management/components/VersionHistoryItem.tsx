
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, AlertCircle, Plus, CheckCircle, GitBranch } from 'lucide-react';
import type { VersionHistory } from '@/services/version-management';

interface VersionHistoryItemProps {
  version: VersionHistory;
}

const VersionHistoryItem: React.FC<VersionHistoryItemProps> = ({ version }) => {
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

  return (
    <div 
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
  );
};

export default VersionHistoryItem;

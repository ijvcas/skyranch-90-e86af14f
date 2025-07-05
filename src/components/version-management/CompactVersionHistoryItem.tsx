import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'; 
import type { VersionHistory } from '@/services/version-management';

interface CompactVersionHistoryItemProps {
  version: VersionHistory;
}

const CompactVersionHistoryItem: React.FC<CompactVersionHistoryItemProps> = ({ version }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'text-red-600';
      case 'minor': return 'text-blue-600';
      case 'patch': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-3 h-auto hover:bg-gray-50"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-left min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1 flex-shrink-0">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <span className="font-mono text-sm font-medium flex-shrink-0">v{version.version}</span>
              <span className={`text-xs uppercase font-medium flex-shrink-0 ${getVersionTypeColor(version.versionType)}`}>
                {version.versionType}
              </span>
              {version.isCurrent && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  Actual
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 sm:ml-auto">
              <span className="hidden sm:inline">Build #{version.buildNumber}</span>
              <span>
                {new Date(version.releaseDate).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="px-9 pb-3">
        <div className="space-y-2 border-l-2 border-gray-100 pl-4 ml-2">
          <p className="text-sm text-gray-700">
            {version.notes}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(version.releaseDate).toLocaleDateString('es-ES')} - {new Date(version.releaseDate).toLocaleTimeString('es-ES')}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {version.publishedBy || 'Sistema'}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CompactVersionHistoryItem;
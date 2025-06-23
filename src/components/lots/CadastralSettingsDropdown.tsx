
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Upload, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import DeleteAllParcelsButton from './DeleteAllParcelsButton';

interface CadastralSettingsDropdownProps {
  onToggleUpload: () => void;
  onParcelsDeleted?: () => void;
}

const CadastralSettingsDropdown: React.FC<CadastralSettingsDropdownProps> = ({
  onToggleUpload,
  onParcelsDeleted
}) => {
  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-10 w-10 p-0"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Configuración</p>
          </TooltipContent>
        </Tooltip>
        
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white border shadow-md z-50"
        >
          <DropdownMenuItem 
            onClick={onToggleUpload}
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span>Importar XML/KML</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <div className="p-1">
            {onParcelsDeleted && (
              <DeleteAllParcelsButton onDeleted={onParcelsDeleted} />
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
};

export default CadastralSettingsDropdown;

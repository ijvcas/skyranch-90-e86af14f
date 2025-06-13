
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/services/userService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserSelectorProps {
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
}

const UserSelector = ({ selectedUserIds, onUserSelectionChange }: UserSelectorProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  // Fetch real users from Supabase
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['app-users'],
    queryFn: getAllUsers
  });

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onUserSelectionChange([...selectedUserIds, userId]);
    } else {
      onUserSelectionChange(selectedUserIds.filter(id => id !== userId));
    }
  };

  const handleSelectAll = () => {
    onUserSelectionChange(users.map(user => user.id));
  };

  const handleSelectNone = () => {
    onUserSelectionChange([]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2" />
            Notificar Usuarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Cargando usuarios...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-gray-50 rounded p-2 -m-2">
            <CardTitle className="flex items-center text-sm">
              <Users className="w-4 h-4 mr-2" />
              Notificar Usuarios
              {selectedUserIds.length > 0 && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {selectedUserIds.length}
                </span>
              )}
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Seleccionar Todos
              </button>
              <span className="text-xs text-gray-400">|</span>
              <button
                type="button"
                onClick={handleSelectNone}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Deseleccionar Todos
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {users.filter(user => user.is_active).map(user => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={(checked) => handleUserToggle(user.id, checked as boolean)}
                  />
                  <Label 
                    htmlFor={`user-${user.id}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {user.name} ({user.role})
                  </Label>
                </div>
              ))}
            </div>
            
            {users.length === 0 && (
              <p className="text-xs text-gray-500">
                No hay usuarios registrados. Puede agregar usuarios desde la página de Configuración.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default UserSelector;

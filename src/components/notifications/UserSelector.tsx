
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { getActiveUsers } from '@/stores/userStore';

interface UserSelectorProps {
  selectedUserIds: string[];
  onUserSelectionChange: (userIds: string[]) => void;
}

const UserSelector = ({ selectedUserIds, onUserSelectionChange }: UserSelectorProps) => {
  const users = getActiveUsers();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Users className="w-4 h-4 mr-2" />
          Notificar Usuarios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          {users.map(user => (
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
        
        {selectedUserIds.length > 0 && (
          <p className="text-xs text-gray-500">
            {selectedUserIds.length} usuario(s) seleccionado(s)
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSelector;

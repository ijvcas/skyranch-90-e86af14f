
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, RefreshCw } from 'lucide-react';

interface UserManagementHeaderProps {
  isFetching: boolean;
  onRefresh: () => void;
  onToggleAddForm: () => void;
}

const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  isFetching,
  onRefresh,
  onToggleAddForm
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Gestión de Usuarios
        </h3>
        <p className="text-sm text-gray-600">Administra usuarios y sus permisos</p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Sincronizando...' : 'Actualizar'}
        </Button>
        <Button
          onClick={onToggleAddForm}
          className="flex items-center gap-2"
          size="sm"
        >
          <UserPlus className="w-4 h-4" />
          Agregar Usuario
        </Button>
      </div>
    </div>
  );
};

export default UserManagementHeader;

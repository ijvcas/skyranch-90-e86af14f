
import React, { useState } from 'react';
import { Shield, Eye, Edit, Trash2, Plus, Database, Calendar, FileText, MapPin, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RoleCard from './permissions/RoleCard';
import PermissionsSummaryCard from './permissions/PermissionsSummaryCard';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

const PermissionsManager = () => {
  const { toast } = useToast();

  const [permissions] = useState<Permission[]>([
    {
      id: 'animals_view',
      name: 'Ver Animales',
      description: 'Permite visualizar la lista y detalles de animales',
      category: 'animals',
      icon: <Eye className="w-4 h-4" />
    },
    {
      id: 'animals_edit',
      name: 'Editar Animales',
      description: 'Permite modificar información de animales',
      category: 'animals',
      icon: <Edit className="w-4 h-4" />
    },
    {
      id: 'animals_delete',
      name: 'Eliminar Animales',
      description: 'Permite eliminar animales del sistema',
      category: 'animals',
      icon: <Trash2 className="w-4 h-4" />
    },
    {
      id: 'animals_create',
      name: 'Crear Animales',
      description: 'Permite agregar nuevos animales',
      category: 'animals',
      icon: <Plus className="w-4 h-4" />
    },
    {
      id: 'lots_manage',
      name: 'Gestionar Lotes',
      description: 'Permite crear, editar y eliminar lotes',
      category: 'lots',
      icon: <MapPin className="w-4 h-4" />
    },
    {
      id: 'health_records',
      name: 'Registros de Salud',
      description: 'Permite gestionar registros médicos',
      category: 'health',
      icon: <FileText className="w-4 h-4" />
    },
    {
      id: 'breeding_records',
      name: 'Registros de Reproducción',
      description: 'Permite gestionar registros reproductivos',
      category: 'breeding',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'calendar_manage',
      name: 'Gestionar Calendario',
      description: 'Permite crear y editar eventos del calendario',
      category: 'calendar',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'users_manage',
      name: 'Gestionar Usuarios',
      description: 'Permite crear, editar y eliminar usuarios',
      category: 'users',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'system_settings',
      name: 'Configuración del Sistema',
      description: 'Permite acceder a configuraciones avanzadas',
      category: 'system',
      icon: <Settings className="w-4 h-4" />
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      color: 'bg-red-100 text-red-800',
      permissions: [
        'animals_view', 'animals_edit', 'animals_delete', 'animals_create',
        'lots_manage', 'health_records', 'breeding_records', 'calendar_manage',
        'users_manage', 'system_settings'
      ]
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Gestión de operaciones y supervición',
      color: 'bg-blue-100 text-blue-800',
      permissions: [
        'animals_view', 'animals_edit', 'animals_create',
        'lots_manage', 'health_records', 'breeding_records', 'calendar_manage'
      ]
    },
    {
      id: 'worker',
      name: 'Trabajador',
      description: 'Operaciones básicas del día a día',
      color: 'bg-green-100 text-green-800',
      permissions: [
        'animals_view', 'animals_edit', 'health_records', 'breeding_records'
      ]
    }
  ]);

  const updateRolePermissions = (roleId: string, permissionId: string, enabled: boolean) => {
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id === roleId) {
          const updatedPermissions = enabled
            ? [...role.permissions, permissionId]
            : role.permissions.filter(p => p !== permissionId);
          
          return { ...role, permissions: updatedPermissions };
        }
        return role;
      })
    );

    toast({
      title: "Permisos Actualizados",
      description: `Los permisos del rol han sido modificados correctamente.`,
    });
  };

  const categorizePermissions = () => {
    const categories = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);

    return categories;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      animals: 'Animales',
      lots: 'Lotes',
      health: 'Salud',
      breeding: 'Reproducción',
      calendar: 'Calendario',
      users: 'Usuarios',
      system: 'Sistema'
    };
    return names[category] || category;
  };

  const categorizedPermissions = categorizePermissions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Gestión de Permisos</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Roles del Sistema</h3>
          <p className="text-sm text-gray-600">
            Configure los permisos específicos para cada rol de usuario
          </p>
        </div>
        
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            categorizedPermissions={categorizedPermissions}
            getCategoryName={getCategoryName}
            onPermissionToggle={updateRolePermissions}
          />
        ))}
      </div>

      <PermissionsSummaryCard roles={roles} />
    </div>
  );
};

export default PermissionsManager;

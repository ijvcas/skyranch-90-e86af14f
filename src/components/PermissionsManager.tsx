
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, User, Users, Settings, Eye, Edit, Trash2, Plus, Database, Calendar, FileText, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
          <Card key={role.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {role.name}
                </CardTitle>
                <Badge className={role.color}>
                  {role.permissions.length} permisos activos
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{role.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {Object.entries(categorizedPermissions).map(([category, categoryPermissions]) => (
                <div key={category}>
                  <h4 className="font-medium text-sm mb-3 text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {getCategoryName(category)}
                  </h4>
                  <div className="space-y-3 pl-4">
                    {categoryPermissions.map((permission) => (
                      <div key={permission.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          {permission.icon}
                          <div>
                            <Label htmlFor={`${role.id}-${permission.id}`} className="font-medium">
                              {permission.name}
                            </Label>
                            <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
                          </div>
                        </div>
                        <Switch
                          id={`${role.id}-${permission.id}`}
                          checked={role.permissions.includes(permission.id)}
                          onCheckedChange={(checked: boolean) => 
                            updateRolePermissions(role.id, permission.id, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  {category !== Object.keys(categorizedPermissions)[Object.keys(categorizedPermissions).length - 1] && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Resumen de Permisos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="text-center">
                <Badge className={`${role.color} mb-2`}>
                  {role.name}
                </Badge>
                <p className="text-2xl font-bold text-gray-800">{role.permissions.length}</p>
                <p className="text-sm text-gray-600">permisos asignados</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsManager;

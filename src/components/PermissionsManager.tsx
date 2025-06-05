
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, User, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, updateUser, getCurrentUser, type AppUser } from '@/services/userService';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'animals' | 'health' | 'breeding' | 'reports' | 'system';
}

interface RolePermissions {
  [key: string]: {
    animals: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    health: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    breeding: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    reports: { view: boolean; create: boolean; edit: boolean; delete: boolean };
    system: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  };
}

const defaultPermissions: RolePermissions = {
  admin: {
    animals: { view: true, create: true, edit: true, delete: true },
    health: { view: true, create: true, edit: true, delete: true },
    breeding: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, create: true, edit: true, delete: true },
    system: { view: true, create: true, edit: true, delete: true },
  },
  manager: {
    animals: { view: true, create: true, edit: true, delete: false },
    health: { view: true, create: true, edit: true, delete: false },
    breeding: { view: true, create: true, edit: true, delete: false },
    reports: { view: true, create: true, edit: false, delete: false },
    system: { view: true, create: false, edit: false, delete: false },
  },
  worker: {
    animals: { view: true, create: true, edit: false, delete: false },
    health: { view: true, create: true, edit: false, delete: false },
    breeding: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, create: false, edit: false, delete: false },
    system: { view: false, create: false, edit: false, delete: false },
  },
};

const PermissionsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>('worker');
  const [permissions, setPermissions] = useState(defaultPermissions);

  // Use real Supabase data instead of mock data
  const { data: users = [] } = useQuery({
    queryKey: ['app-users'],
    queryFn: getAllUsers,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<AppUser> }) => 
      updateUser(userId, updates),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      toast({
        title: "Rol Actualizado",
        description: `El rol del usuario ha sido cambiado a ${getRoleLabel(updatedUser.role)}`,
      });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario",
        variant: "destructive"
      });
    }
  });

  const handleRoleChange = (userId: string, newRole: 'admin' | 'manager' | 'worker') => {
    updateUserMutation.mutate({ userId, updates: { role: newRole } });
  };

  const handlePermissionChange = (
    role: string,
    category: keyof RolePermissions['admin'],
    action: 'view' | 'create' | 'edit' | 'delete',
    value: boolean
  ) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [category]: {
          ...prev[role][category],
          [action]: value
        }
      }
    }));

    toast({
      title: "Permisos Actualizados",
      description: `Los permisos del rol ${getRoleLabel(role)} han sido modificados`,
    });
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      admin: 'Administrador',
      manager: 'Gerente',
      worker: 'Trabajador'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      worker: 'bg-green-100 text-green-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      animals: 'Animales',
      health: 'Salud',
      breeding: 'Reproducción',
      reports: 'Reportes',
      system: 'Sistema'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getActionIcon = (action: string) => {
    const icons = {
      view: Eye,
      create: User,
      edit: Edit,
      delete: Trash2
    };
    const Icon = icons[action as keyof typeof icons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Gestión de Permisos
          </h3>
          <p className="text-sm text-gray-600">Administra roles y permisos de usuarios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users and Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios y Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as any)}
                        disabled={currentUser?.id === user.id || updateUserMutation.isPending}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="worker">Trabajador</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Role Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Matriz de Permisos por Rol</CardTitle>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="worker">Trabajador</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissions[selectedRole]).map(([category, actions]) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    {getCategoryLabel(category)}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(actions).map(([action, enabled]) => (
                      <div key={action} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(action)}
                          <span className="text-sm capitalize">{action === 'view' ? 'Ver' : action === 'create' ? 'Crear' : action === 'edit' ? 'Editar' : 'Eliminar'}</span>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(value) => 
                            handlePermissionChange(selectedRole, category as any, action as any, value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(permissions).map(([role, rolePermissions]) => (
              <div key={role} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{getRoleLabel(role)}</h4>
                  <Badge className={getRoleBadgeColor(role)}>
                    {Object.values(rolePermissions).flat().filter(Boolean).length} permisos
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  {Object.entries(rolePermissions).map(([category, actions]) => {
                    const enabledActions = Object.entries(actions).filter(([, enabled]) => enabled);
                    return enabledActions.length > 0 ? (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-600">{getCategoryLabel(category)}</span>
                        <span className="font-medium">{enabledActions.length}/4</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionsManager;

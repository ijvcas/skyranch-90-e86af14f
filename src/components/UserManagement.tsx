import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Users, UserPlus, UserMinus, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllUsers, 
  addUser, 
  deleteUser, 
  toggleUserStatus, 
  getCurrentUser,
  type AppUser
} from '@/services/userService';

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'worker' as AppUser['role'],
    is_active: true
  });

  // Fetch users from Supabase with automatic refetching
  const { data: users = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['app-users'],
    queryFn: getAllUsers,
    refetchInterval: 30000, // Refetch every 30 seconds to catch new users
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Force refresh on component mount
  useEffect(() => {
    console.log('UserManagement component mounted, forcing refresh...');
    refetch();
  }, [refetch]);

  // Mutations for user operations
  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      setNewUser({ name: '', email: '', role: 'worker', is_active: true });
      setShowAddForm(false);
      toast({
        title: "Usuario Agregado",
        description: `${newUser.name} ha sido agregado exitosamente`,
      });
    },
    onError: (error) => {
      console.error('Error adding user:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el usuario",
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      const deletedUser = users.find(u => u.id === id);
      toast({
        title: "Usuario Completamente Eliminado",
        description: `${deletedUser?.name} ha sido eliminado completamente del sistema (aplicación y autenticación).`,
        duration: 5000
      });
    },
    onError: (error: Error) => {
      console.error('Error deleting user:', error);
      queryClient.invalidateQueries({ queryKey: ['app-users'] }); // Refresh to show partial deletion
      
      if (error.message.includes('auth deletion failed')) {
        toast({
          title: "Eliminación Parcial",
          description: error.message,
          variant: "destructive",
          duration: 8000
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "No se pudo eliminar el usuario",
          variant: "destructive",
          duration: 8000
        });
      }
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      toast({
        title: "Estado Actualizado",
        description: `${updatedUser.name} ${updatedUser.is_active ? 'activado' : 'desactivado'}`,
      });
    },
    onError: (error) => {
      console.error('Error toggling user status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive"
      });
    }
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Error",
        description: "Nombre y email son requeridos",
        variant: "destructive"
      });
      return;
    }

    addUserMutation.mutate(newUser);
  };

  const handleDeleteUser = (id: string, userName: string) => {
    if (currentUser?.id === id) {
      toast({
        title: "Error",
        description: "No puedes eliminar tu propia cuenta",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar a ${userName}?\n\nNota: El usuario será eliminado de la aplicación, pero permanecerá en el sistema de autenticación. La eliminación completa requiere privilegios de administrador del servidor.`)) {
      deleteUserMutation.mutate(id);
    }
  };

  const handleToggleStatus = (id: string, userName: string) => {
    if (currentUser?.id === id) {
      toast({
        title: "Error",
        description: "No puedes desactivar tu propia cuenta",
        variant: "destructive"
      });
      return;
    }

    toggleStatusMutation.mutate(id);
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    toast({
      title: "Sincronizando",
      description: "Actualizando lista de usuarios desde todos los sistemas...",
    });
    queryClient.invalidateQueries({ queryKey: ['app-users'] });
    refetch();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
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
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            disabled={isFetching}
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Sincronizando...' : 'Actualizar'}
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2"
            size="sm"
          >
            <UserPlus className="w-4 h-4" />
            Agregar Usuario
          </Button>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Juan Pérez"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="juan@granja.com"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as AppUser['role']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="worker">Trabajador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={addUserMutation.isPending}>
                  {addUserMutation.isPending ? 'Agregando...' : 'Agregar Usuario'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Registro</TableHead>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleStatus(user.id, user.name)}
                        disabled={currentUser?.id === user.id || toggleStatusMutation.isPending}
                      />
                      <span className="text-sm">
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      variant="ghost"
                      size="sm"
                      disabled={currentUser?.id === user.id || deleteUserMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;

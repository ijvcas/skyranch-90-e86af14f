
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  getAllUsers, 
  getCurrentUser,
  type AppUser
} from '@/services/userService';
import EditUserDialog from './EditUserDialog';
import UserManagementHeader from './user-management/UserManagementHeader';
import AddUserForm from './user-management/AddUserForm';
import UsersTable from './user-management/UsersTable';
import { useUserManagement } from './user-management/useUserManagement';
import { useState } from 'react';

const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  
  const {
    showAddForm,
    setShowAddForm,
    newUser,
    setNewUser,
    handleAddUser,
    addUserMutation,
    deleteUserMutation,
    toggleStatusMutation
  } = useUserManagement();

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
      <UserManagementHeader
        isFetching={isFetching}
        onRefresh={handleRefresh}
        onToggleAddForm={() => setShowAddForm(!showAddForm)}
      />

      {showAddForm && (
        <AddUserForm
          newUser={newUser}
          onUserChange={setNewUser}
          onSubmit={handleAddUser}
          onCancel={() => setShowAddForm(false)}
          isLoading={addUserMutation.isPending}
        />
      )}

      <UsersTable
        users={users}
        currentUser={currentUser}
        onEditUser={setEditingUser}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        isToggling={toggleStatusMutation.isPending}
        isDeleting={deleteUserMutation.isPending}
      />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;

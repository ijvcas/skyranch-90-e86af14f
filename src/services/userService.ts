
import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'worker';
  created_at: string;
  is_active: boolean;
  created_by?: string;
}

export const getAllUsers = async (): Promise<AppUser[]> => {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .neq('name', 'Admin Usuario') // Exclude the old admin user
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return (data || []).map(user => ({
    ...user,
    // Automatically assign admin role to Juan Casanova H
    role: user.email === 'juan.casanova@skyranch.com' ? 'admin' : user.role as 'admin' | 'manager' | 'worker'
  }));
};

export const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'created_by'>): Promise<AppUser> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Prevent adding users with the old admin name
  if (userData.name === 'Admin Usuario') {
    throw new Error('No se puede crear un usuario con ese nombre');
  }
  
  const { data, error } = await supabase
    .from('app_users')
    .insert([{
      ...userData,
      created_by: user?.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error adding user:', error);
    throw error;
  }

  return {
    ...data,
    role: data.role as 'admin' | 'manager' | 'worker'
  };
};

export const updateUser = async (id: string, updates: Partial<AppUser>): Promise<AppUser> => {
  const { data, error } = await supabase
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .neq('name', 'Admin Usuario') // Prevent updating the old admin user
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }

  return {
    ...data,
    role: data.role as 'admin' | 'manager' | 'worker'
  };
};

export const deleteUser = async (id: string): Promise<boolean> => {
  // First check if this is the old admin user and delete it
  const { data: userToDelete } = await supabase
    .from('app_users')
    .select('name')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }

  return true;
};

export const toggleUserStatus = async (id: string): Promise<AppUser> => {
  // First get the current user to toggle their status
  const { data: currentUser, error: fetchError } = await supabase
    .from('app_users')
    .select('is_active, name')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching user:', fetchError);
    throw fetchError;
  }

  // Prevent toggling the old admin user
  if (currentUser.name === 'Admin Usuario') {
    throw new Error('No se puede modificar el estado de este usuario');
  }

  const { data, error } = await supabase
    .from('app_users')
    .update({ is_active: !currentUser.is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }

  return {
    ...data,
    role: data.role as 'admin' | 'manager' | 'worker'
  };
};

export const getCurrentUser = async (): Promise<AppUser | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('created_by', user.id)
    .neq('name', 'Admin Usuario') // Exclude old admin
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching current user:', error);
    return null;
  }

  return {
    ...data,
    role: data.role as 'admin' | 'manager' | 'worker'
  };
};

// Function to clean up old admin user
export const removeOldAdminUser = async (): Promise<void> => {
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('name', 'Admin Usuario');

  if (error) {
    console.error('Error removing old admin user:', error);
    throw error;
  }
};

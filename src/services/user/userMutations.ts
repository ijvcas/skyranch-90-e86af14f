
import { supabase } from '@/integrations/supabase/client';
import { type AppUser } from './types';

// Add a new user to the app_users table
export const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'created_by'>): Promise<boolean> => {
  try {
    console.log('➕ Adding new user:', userData);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.error('❌ No authenticated user to perform this operation');
      throw new Error('No authenticated user');
    }

    // Insert into app_users table (without phone for now since it doesn't exist in schema)
    const { data, error } = await supabase
      .from('app_users')
      .insert([{
        name: userData.name,
        email: userData.email,
        role: userData.role,
        is_active: userData.is_active,
        created_by: currentUser.id
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error adding user to app_users:', error);
      throw new Error(`Error adding user: ${error.message}`);
    }

    console.log('✅ User added successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Error in addUser:', error);
    throw error;
  }
};

// Update user information (without phone field for now)
export const updateUser = async (userId: string, updates: Partial<AppUser>): Promise<boolean> => {
  try {
    console.log('📝 Updating user:', userId, updates);

    // Prepare update data - excluding phone since it doesn't exist in schema
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

    console.log('📝 Actual update data being sent:', updateData);

    const { error } = await supabase
      .from('app_users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating user:', error);
      throw new Error(`Error updating user: ${error.message}`);
    }

    console.log('✅ User updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    throw error;
  }
};

// Delete user from app_users table
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting user:', userId);

    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('❌ Error deleting user from app_users:', error);
      throw new Error(`No se pudo eliminar el usuario: ${error.message}`);
    }

    console.log('✅ User deleted successfully from app_users');
    return true;
  } catch (error) {
    console.error('❌ Error in deleteUser:', error);
    throw error;
  }
};

// Toggle user active status
export const toggleUserStatus = async (userId: string): Promise<AppUser> => {
  try {
    console.log('🔄 Toggling user status:', userId);

    // First get current status
    const { data: currentUser, error: fetchError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching user for status toggle:', fetchError);
      throw fetchError;
    }

    // Toggle the status
    const newStatus = !currentUser.is_active;

    const { data, error } = await supabase
      .from('app_users')
      .update({ is_active: newStatus })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error toggling user status:', error);
      throw error;
    }

    console.log('✅ User status toggled successfully');
    return {
      ...data,
      role: data.role as 'admin' | 'manager' | 'worker',
      phone: '', // Default empty phone since field doesn't exist in schema
    };
  } catch (error) {
    console.error('❌ Error in toggleUserStatus:', error);
    throw error;
  }
};

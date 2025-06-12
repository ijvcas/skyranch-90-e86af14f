
import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string; // Optional since it may not exist in DB yet
  role: 'admin' | 'manager' | 'worker';
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

// Get all users from the app_users table
export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    console.log('🔍 Fetching all users from app_users table...');
    
    const { data: users, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }

    console.log('✅ Successfully fetched users:', users?.length || 0);
    
    // Map the data to include phone as optional field
    return users?.map(user => ({
      ...user,
      phone: user.phone || '', // Default to empty string if phone doesn't exist
    })) || [];
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    return [];
  }
};

// Get current authenticated user info
export const getCurrentUser = async (): Promise<AppUser | null> => {
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return null;
    }

    if (!authUser) {
      console.log('❌ No authenticated user found');
      return null;
    }

    const { data: appUser, error: dbError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (dbError) {
      console.error('❌ Database error:', dbError);
      return null;
    }

    return {
      ...appUser,
      phone: appUser.phone || '', // Default to empty string if phone doesn't exist
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

// Add a new user to the app_users table
export const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'created_by'>): Promise<boolean> => {
  try {
    console.log('➕ Adding new user:', userData);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.error('❌ No authenticated user to perform this operation');
      return false;
    }

    // Insert into app_users table (without phone field for now)
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
      return false;
    }

    console.log('✅ User added successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Error in addUser:', error);
    return false;
  }
};

// Update user information
export const updateUser = async (userId: string, updates: Partial<AppUser>): Promise<boolean> => {
  try {
    console.log('📝 Updating user:', userId, updates);

    // Only update fields that exist in the database
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;
    // Skip phone field since it doesn't exist in DB yet

    const { error } = await supabase
      .from('app_users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('❌ Error updating user:', error);
      return false;
    }

    console.log('✅ User updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in updateUser:', error);
    return false;
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
      phone: data.phone || '', // Default to empty string if phone doesn't exist
    };
  } catch (error) {
    console.error('❌ Error in toggleUserStatus:', error);
    throw error;
  }
};


import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'worker';
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

// Phone validation and formatting utilities
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true; // Optional field
  
  // Remove all non-digit characters for validation
  const digits = phone.replace(/\D/g, '');
  
  // Check various valid formats
  const patterns = [
    /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/, // US format
    /^\+?[1-9]\d{1,14}$/ // International format (E.164)
  ];
  
  return patterns.some(pattern => pattern.test(digits)) && digits.length >= 10;
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format as US phone number if it looks like one
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if we can't format it
};

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
    
    // Map the data with proper typing
    return users?.map(user => ({
      ...user,
      role: user.role as 'admin' | 'manager' | 'worker',
      phone: user.phone || '',
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

    // Insert into app_users table
    const { data, error } = await supabase
      .from('app_users')
      .insert([{
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
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

    // Prepare update data
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

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

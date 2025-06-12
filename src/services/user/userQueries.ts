
import { supabase } from '@/integrations/supabase/client';
import { type AppUser } from './types';

// Get all users from the app_users table AND sync auth users
export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    console.log('🔍 Fetching all users from app_users table...');
    
    // First, get all auth users to sync any missing ones
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      await ensureUserInAppUsers(currentUser);
    }

    const { data: users, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching users:', error);
      throw error;
    }

    console.log('✅ Successfully fetched users:', users?.length || 0);
    
    // Map the data with proper typing and handle missing phone field
    return users?.map(user => ({
      ...user,
      role: user.role as 'admin' | 'manager' | 'worker',
      phone: '', // Default empty phone since field doesn't exist in schema
    })) || [];
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    return [];
  }
};

// Ensure a user exists in app_users table
const ensureUserInAppUsers = async (authUser: any): Promise<void> => {
  try {
    // Check if user exists in app_users
    const { data: existingUser, error: checkError } = await supabase
      .from('app_users')
      .select('id')
      .eq('id', authUser.id)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // User doesn't exist, create them
      console.log('🆕 Creating missing user in app_users:', authUser.email);
      
      const { error: insertError } = await supabase
        .from('app_users')
        .insert([{
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'New User',
          email: authUser.email,
          role: 'worker', // Default role
          is_active: true,
          created_by: authUser.id
        }]);

      if (insertError) {
        console.error('❌ Error creating user in app_users:', insertError);
      } else {
        console.log('✅ User created successfully in app_users');
      }
    }
  } catch (error) {
    console.error('❌ Error ensuring user in app_users:', error);
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

    // Ensure user exists in app_users
    await ensureUserInAppUsers(authUser);

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
      role: appUser.role as 'admin' | 'manager' | 'worker',
      phone: '', // Default empty phone since field doesn't exist in schema
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

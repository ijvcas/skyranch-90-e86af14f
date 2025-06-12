
import { supabase } from '@/integrations/supabase/client';
import { type AppUser } from './types';

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
    
    // Map the data with proper typing and handle missing phone field
    return users?.map(user => ({
      ...user,
      role: user.role as 'admin' | 'manager' | 'worker',
      phone: (user as any).phone || '', // Type assertion for phone field
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
      role: appUser.role as 'admin' | 'manager' | 'worker',
      phone: (appUser as any).phone || '', // Type assertion for phone field
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

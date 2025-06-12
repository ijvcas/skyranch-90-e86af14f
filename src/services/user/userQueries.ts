
import { supabase } from '@/integrations/supabase/client';
import { type AppUser } from './types';

// Get all users from the app_users table AND sync auth users
export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    console.log('🔍 Fetching all users from app_users table...');
    
    // First, sync any missing auth users
    await syncAuthUsersToAppUsers();

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
      phone: user.phone || '', // Now properly handled from database
    })) || [];
  } catch (error) {
    console.error('❌ Error in getAllUsers:', error);
    return [];
  }
};

// Sync all auth users to app_users table
export const syncAuthUsersToAppUsers = async (): Promise<void> => {
  try {
    console.log('🔄 Syncing auth users to app_users...');
    
    const { error } = await supabase.rpc('sync_auth_users_to_app_users');
    
    if (error) {
      console.error('❌ Error syncing users:', error);
      throw error;
    }
    
    console.log('✅ Successfully synced auth users to app_users');
  } catch (error) {
    console.error('❌ Error in syncAuthUsersToAppUsers:', error);
    throw error;
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
    await syncAuthUsersToAppUsers();

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
      phone: appUser.phone || '',
    };
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    return null;
  }
};

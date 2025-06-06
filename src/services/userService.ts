
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Create admin client for service_role operations
const supabaseAdmin = createClient(
  "https://ahwhtxygyzoadsmdrwwg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2h0eHlneXpvYWRzbWRyd3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEyMjE3MywiZXhwIjoyMDY0Njk4MTczfQ.gWkm7l9n_vONc1MYr0x7Q6sJBL0aI3rRBF8QjGYjkqU"
);

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'worker';
  created_at: string;
  is_active: boolean;
  created_by?: string;
}

interface AuthUser {
  id: string;
  email: string;
  raw_user_meta_data?: any;
  created_at: string;
}

export const getAllUsers = async (): Promise<AppUser[]> => {
  console.log('🔍 Starting getAllUsers - fetching all users...');
  
  // First, let's get the current authenticated user and ensure they are synced
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  console.log('🔍 Current authenticated user:', currentUser?.email);
  
  if (currentUser && currentUser.email) {
    console.log(`🔄 Ensuring current user ${currentUser.email} is synced...`);
    const userName = currentUser.user_metadata?.full_name || currentUser.email;
    await syncUserToAppUsers(currentUser.id, currentUser.email, userName);
  }

  // Get all profiles first using admin client for better access
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
  } else {
    console.log('✅ Profile users found:', profiles?.length || 0, profiles?.map(p => ({ email: p.email, id: p.id })));
    
    // Sync all profiles to app_users
    if (profiles && profiles.length > 0) {
      console.log('🔄 Starting profile sync process...');
      for (const profile of profiles) {
        if (profile.email && profile.id) {
          console.log(`🔍 Processing profile: ${profile.email} (ID: ${profile.id})`);
          await syncUserToAppUsers(profile.id, profile.email, profile.full_name || profile.email);
        }
      }
      console.log('✅ Profile sync process completed');
    }
  }

  // Try to get auth users using admin client
  try {
    console.log('🔍 Checking for auth users using admin client...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (!authError && authUsers && authUsers.users) {
      console.log('✅ Found auth users via admin client:', authUsers.users.length);
      console.log('🔍 Auth users details:', authUsers.users.map(u => ({ email: u.email, id: u.id })));
      
      for (const authUser of authUsers.users) {
        if (authUser.email && authUser.id) {
          console.log(`🔍 Processing auth user: ${authUser.email}`);
          
          // Check if profile exists, if not create it
          const existingProfile = profiles?.find(p => p.id === authUser.id);
          if (!existingProfile) {
            console.log(`➕ Creating missing profile for ${authUser.email}`);
            const { error: profileCreateError } = await supabaseAdmin
              .from('profiles')
              .upsert([{
                id: authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name || authUser.email
              }], {
                onConflict: 'id'
              });
              
            if (profileCreateError) {
              console.error('❌ Error creating profile:', profileCreateError);
            } else {
              console.log(`✅ Profile created for ${authUser.email}`);
            }
          }
          
          // Sync to app_users
          await syncUserToAppUsers(
            authUser.id, 
            authUser.email, 
            authUser.user_metadata?.full_name || authUser.email
          );
        }
      }
    } else {
      console.log('ℹ️ Could not fetch auth users via admin client:', authError);
    }
  } catch (error) {
    console.log('ℹ️ Auth users admin access not available, continuing with profiles only:', error);
  }

  // Now get all users from app_users table
  const { data: appUsers, error: appUsersError } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (appUsersError) {
    console.error('❌ Error fetching app users:', appUsersError);
    return [];
  }

  console.log('📊 App users found:', appUsers?.length || 0, appUsers?.map(u => ({ email: u.email, name: u.name })));

  const allUsers: AppUser[] = [];

  // Process all app_users
  if (appUsers) {
    appUsers.forEach(user => {
      allUsers.push({
        ...user,
        role: user.email === 'juan.casanova@skyranch.com' || user.email === 'jvcas@mac.com' 
          ? 'admin' 
          : user.role as 'admin' | 'manager' | 'worker'
      });
    });
  }

  console.log('📋 Total users returned:', allUsers.length, allUsers.map(u => ({ email: u.email, name: u.name })));
  return allUsers;
};

export const syncUserToAppUsers = async (profileId: string, email: string, fullName: string): Promise<void> => {
  console.log(`🔄 Attempting to sync user: ${email} (ID: ${profileId})`);
  
  // Determine role based on email - new users get 'worker' role by default
  const role = (email === 'juan.casanova@skyranch.com' || email === 'jvcas@mac.com') 
    ? 'admin' 
    : 'worker';

  console.log(`➕ Syncing user to app_users: ${email} with role: ${role}`);

  // Use upsert to handle both insert and update cases
  const { error } = await supabase
    .from('app_users')
    .upsert([{
      id: profileId,
      name: fullName || email,
      email: email,
      role: role,
      is_active: true
    }], {
      onConflict: 'id'
    });

  if (error) {
    console.error('❌ Error upserting user:', error);
  } else {
    console.log(`✅ User ${email} successfully synced to app_users table`);
  }
};

export const addUser = async (userData: Omit<AppUser, 'id' | 'created_at' | 'created_by'>): Promise<AppUser> => {
  const { data: { user } } = await supabase.auth.getUser();
  
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
  console.log(`🗑️ Attempting to delete user with ID: ${id}`);
  
  // Get user info first for logging
  const { data: userToDelete } = await supabase
    .from('app_users')
    .select('email')
    .eq('id', id)
    .single();

  const userEmail = userToDelete?.email || 'unknown';
  
  // Prevent deletion of admin users
  if (userEmail === 'juan.casanova@skyranch.com' || userEmail === 'jvcas@mac.com') {
    console.log(`🚫 Cannot delete admin user: ${userEmail}`);
    throw new Error('Cannot delete admin users');
  }
  
  console.log(`🗑️ Deleting user: ${userEmail}`);

  // Step 1: Delete from app_users table
  const { error: appUserError } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (appUserError) {
    console.error('❌ Error deleting from app_users:', appUserError);
    throw appUserError;
  }
  console.log(`✅ Deleted ${userEmail} from app_users table`);

  // Step 2: Delete from profiles table
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    console.error('❌ Error deleting from profiles:', profileError);
  } else {
    console.log(`✅ Deleted ${userEmail} from profiles table`);
  }

  // Step 3: Delete from auth system using admin client
  try {
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    
    if (authError) {
      console.error('❌ Error deleting from auth system:', authError);
      throw new Error(`User removed from app but auth deletion failed: ${authError.message}`);
    } else {
      console.log(`✅ Successfully deleted ${userEmail} from auth system`);
    }
  } catch (error) {
    console.error('❌ Auth deletion failed:', error);
    throw new Error(`User removed from app but auth deletion failed: ${error}`);
  }

  console.log(`✅ User ${userEmail} completely removed from all systems`);
  return true;
};

export const toggleUserStatus = async (id: string): Promise<AppUser> => {
  // First get the current user to toggle their status
  const { data: currentUser, error: fetchError } = await supabase
    .from('app_users')
    .select('is_active')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching user:', fetchError);
    throw fetchError;
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
  
  if (!user) {
    console.log('🚫 No authenticated user found');
    return null;
  }

  console.log(`🔍 Getting current user data for: ${user.email}`);

  // Ensure current user is synced first
  if (user.email) {
    const userName = user.user_metadata?.full_name || user.email;
    await syncUserToAppUsers(user.id, user.email, userName);
  }

  // Now try to find in app_users by email first, then by ID
  let { data: appUser, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', user.email)
    .maybeSingle();

  // If not found by email, try by ID
  if (!appUser && !error) {
    const result = await supabase
      .from('app_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    appUser = result.data;
    error = result.error;
  }

  if (appUser) {
    console.log(`✅ Found current user in app_users: ${appUser.email}`);
    return {
      ...appUser,
      role: appUser.role as 'admin' | 'manager' | 'worker'
    };
  }

  console.log(`❌ Current user not found in app_users after sync attempt`);
  return null;
};

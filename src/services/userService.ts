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
  console.log('🔍 Starting getAllUsers - fetching all users...');
  
  // First, let's get the current authenticated user and ensure they are synced
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  console.log('🔍 Current authenticated user:', currentUser?.email);
  
  if (currentUser && currentUser.email) {
    console.log(`🔄 Ensuring current user ${currentUser.email} is synced...`);
    const userName = currentUser.user_metadata?.full_name || currentUser.email;
    await syncUserToAppUsers(currentUser.id, currentUser.email, userName);
  }

  // Try to get users from auth.users table using admin functions
  // This will help us find users that might not have profiles
  console.log('🔍 Attempting to fetch all auth users...');
  
  // Get all profiles first
  const { data: profiles, error: profilesError } = await supabase
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

  // Also try to sync any auth users that might not have profiles
  // This is a fallback for users who signed up but didn't get a profile created
  try {
    console.log('🔍 Checking for auth users without profiles...');
    
    // Try to get users through the RPC endpoint if available
    const { data: authUsers, error: authError } = await supabase.rpc('get_auth_users');
    
    if (!authError && authUsers) {
      console.log('✅ Found auth users via RPC:', authUsers.length);
      for (const authUser of authUsers) {
        if (authUser.email && authUser.id) {
          console.log(`🔍 Processing auth user: ${authUser.email}`);
          
          // Check if profile exists, if not create it
          const existingProfile = profiles?.find(p => p.id === authUser.id);
          if (!existingProfile) {
            console.log(`➕ Creating missing profile for ${authUser.email}`);
            const { error: profileCreateError } = await supabase
              .from('profiles')
              .upsert([{
                id: authUser.id,
                email: authUser.email,
                full_name: authUser.raw_user_meta_data?.full_name || authUser.email
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
            authUser.raw_user_meta_data?.full_name || authUser.email
          );
        }
      }
    } else {
      console.log('ℹ️ Could not fetch auth users via RPC (this is normal if RPC function is not available)');
    }
  } catch (error) {
    console.log('ℹ️ Auth users RPC not available, continuing with profiles only');
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

  // First, check if user already exists
  const { data: existingUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', profileId)
    .single();

  if (existingUser) {
    console.log(`✅ User ${email} already exists in app_users, updating...`);
    const { error: updateError } = await supabase
      .from('app_users')
      .update({
        name: fullName || email,
        email: email,
        role: existingUser.role || role, // Keep existing role if it exists
        is_active: true
      })
      .eq('id', profileId);
      
    if (updateError) {
      console.error('❌ Error updating existing user:', updateError);
    } else {
      console.log(`✅ User ${email} successfully updated in app_users table`);
    }
  } else {
    // User doesn't exist, insert new record
    const { error: insertError } = await supabase
      .from('app_users')
      .insert([{
        id: profileId,
        name: fullName || email,
        email: email,
        role: role,
        is_active: true
      }]);

    if (insertError) {
      console.error('❌ Error inserting new user:', insertError);
    } else {
      console.log(`✅ User ${email} successfully inserted into app_users table`);
    }
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
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (profileError) {
    console.error('❌ Error deleting from profiles:', profileError);
    // Don't throw, continue with auth deletion
  } else {
    console.log(`✅ Deleted ${userEmail} from profiles table`);
  }

  // Step 3: Try to delete from auth system (this requires admin privileges)
  try {
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.error('❌ Error deleting from auth system (admin required):', authError);
      console.log('ℹ️ User removed from app tables but may still exist in auth system');
    } else {
      console.log(`✅ User ${userEmail} successfully deleted from auth system`);
    }
  } catch (error) {
    console.error('❌ Error calling auth admin delete:', error);
    console.log('ℹ️ User removed from app tables but may still exist in auth system');
  }

  console.log(`✅ User ${userEmail} deletion process completed`);
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

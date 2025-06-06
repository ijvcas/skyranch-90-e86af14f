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
  
  // First get all auth users from profiles to ensure we don't miss any registered users
  const { data: authUsers, error: authError } = await supabase
    .from('profiles')
    .select('*');

  if (authError) {
    console.error('❌ Error fetching profiles:', authError);
  } else {
    console.log('✅ Profile users found:', authUsers?.length || 0, authUsers?.map(u => u.email));
  }

  // Sync ALL users from profiles to app_users (this ensures no one is missing)
  if (authUsers && authUsers.length > 0) {
    console.log('🔄 Starting user sync process...');
    for (const profile of authUsers) {
      if (profile.email) {
        console.log(`🔍 Processing user: ${profile.email}`);
        await syncUserToAppUsers(profile.id, profile.email, profile.full_name || profile.email);
      }
    }
    console.log('✅ User sync process completed');
  }

  // Also check if current authenticated user exists and sync them
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  if (currentUser && currentUser.email) {
    console.log(`🔄 Ensuring current user ${currentUser.email} is synced...`);
    const userName = currentUser.user_metadata?.full_name || currentUser.email;
    await syncUserToAppUsers(currentUser.id, currentUser.email, userName);
  }

  // Now get all users from app_users table after syncing
  const { data: appUsers, error: appUsersError } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (appUsersError) {
    console.error('❌ Error fetching app users:', appUsersError);
    return [];
  }

  console.log('📊 App users found:', appUsers?.length || 0, appUsers?.map(u => u.email));

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

  console.log('📋 Total users returned:', allUsers.length, allUsers.map(u => u.email));
  return allUsers;
};

export const syncUserToAppUsers = async (profileId: string, email: string, fullName: string): Promise<void> => {
  console.log(`🔄 Attempting to sync user: ${email} (ID: ${profileId})`);
  
  // Check if user already exists in app_users by email
  const { data: existingUser, error: checkError } = await supabase
    .from('app_users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Error checking existing user:', checkError);
    return;
  }

  if (!existingUser) {
    // Determine role based on email - new users get 'worker' role by default
    const role = (email === 'juan.casanova@skyranch.com' || email === 'jvcas@mac.com') 
      ? 'admin' 
      : 'worker';

    console.log(`➕ Syncing new user to app_users: ${email} with role: ${role}`);

    // Try to add to app_users table using upsert to handle duplicates
    const { error } = await supabase
      .from('app_users')
      .upsert([{
        id: profileId,
        name: fullName || email,
        email: email,
        role: role,
        is_active: true
      }], {
        onConflict: 'email',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('❌ Error syncing user to app_users:', error);
    } else {
      console.log(`✅ User ${email} successfully synced to app_users table`);
    }
  } else {
    console.log(`✅ User ${email} already exists in app_users table`);
    
    // Update the user record if the ID doesn't match (in case of profile ID changes)
    if (existingUser.id !== profileId) {
      console.log(`🔄 Updating user ID for ${email} from ${existingUser.id} to ${profileId}`);
      const { error: updateError } = await supabase
        .from('app_users')
        .update({ id: profileId, name: fullName || email })
        .eq('email', email);
        
      if (updateError) {
        console.error('❌ Error updating user ID:', updateError);
      } else {
        console.log(`✅ User ${email} ID successfully updated`);
      }
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

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

  // Get all profiles to see what we have there
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*');

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError);
  } else {
    console.log('✅ Profile users found:', profiles?.length || 0, profiles?.map(p => p.email));
    
    // Sync all profiles to app_users
    if (profiles && profiles.length > 0) {
      console.log('🔄 Starting profile sync process...');
      for (const profile of profiles) {
        if (profile.email) {
          console.log(`🔍 Processing profile: ${profile.email}`);
          await syncUserToAppUsers(profile.id, profile.email, profile.full_name || profile.email);
        }
      }
      console.log('✅ Profile sync process completed');
    }
  }

  // If we have no profiles, let's try to get users directly from the auth system
  // This might help in cases where the profiles trigger isn't working
  if (!profiles || profiles.length === 0) {
    console.log('⚠️ No profiles found, checking if current user needs to be added to profiles...');
    if (currentUser && currentUser.email) {
      // Create profile for current user if it doesn't exist
      const { error: profileInsertError } = await supabase
        .from('profiles')
        .upsert([{
          id: currentUser.id,
          email: currentUser.email,
          full_name: currentUser.user_metadata?.full_name || currentUser.email
        }], {
          onConflict: 'id',
          ignoreDuplicates: false
        });
        
      if (profileInsertError) {
        console.error('❌ Error creating profile:', profileInsertError);
      } else {
        console.log('✅ Current user profile created/updated');
        // Now sync to app_users
        await syncUserToAppUsers(currentUser.id, currentUser.email, currentUser.user_metadata?.full_name || currentUser.email);
      }
    }
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
  
  // Determine role based on email - new users get 'worker' role by default
  const role = (email === 'juan.casanova@skyranch.com' || email === 'jvcas@mac.com') 
    ? 'admin' 
    : 'worker';

  console.log(`➕ Syncing user to app_users: ${email} with role: ${role}`);

  // Use upsert to handle both inserts and updates
  const { error } = await supabase
    .from('app_users')
    .upsert([{
      id: profileId,
      name: fullName || email,
      email: email,
      role: role,
      is_active: true
    }], {
      onConflict: 'id',
      ignoreDuplicates: false
    });

  if (error) {
    console.error('❌ Error syncing user to app_users:', error);
    
    // If there's a unique constraint error on email, try updating by email
    if (error.code === '23505' && error.message.includes('email')) {
      console.log(`🔄 Email conflict, trying to update existing record for ${email}`);
      const { error: updateError } = await supabase
        .from('app_users')
        .update({
          id: profileId,
          name: fullName || email,
          role: role,
          is_active: true
        })
        .eq('email', email);
        
      if (updateError) {
        console.error('❌ Error updating user by email:', updateError);
      } else {
        console.log(`✅ User ${email} successfully updated by email`);
      }
    }
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

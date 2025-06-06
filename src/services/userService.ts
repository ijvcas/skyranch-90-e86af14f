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
  console.log('Fetching all users...');
  
  // First get all users from app_users table
  const { data: appUsers, error: appUsersError } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (appUsersError) {
    console.error('Error fetching app users:', appUsersError);
  }

  // Then get all auth users to ensure we don't miss any registered users
  const { data: authUsers, error: authError } = await supabase
    .from('profiles')
    .select('*');

  if (authError) {
    console.error('Error fetching profiles:', authError);
  }

  console.log('App users found:', appUsers?.length || 0);
  console.log('Profile users found:', authUsers?.length || 0);

  // Combine and deduplicate users
  const allUsers: AppUser[] = [];
  const userEmails = new Set<string>();

  // Add app_users first
  if (appUsers) {
    appUsers.forEach(user => {
      allUsers.push({
        ...user,
        role: user.email === 'juan.casanova@skyranch.com' || user.email === 'jvcas@mac.com' 
          ? 'admin' 
          : user.role as 'admin' | 'manager' | 'worker'
      });
      userEmails.add(user.email);
    });
  }

  // Add profiles that aren't already in app_users and auto-sync them
  if (authUsers) {
    for (const profile of authUsers) {
      if (!userEmails.has(profile.email) && profile.email) {
        console.log(`Found profile not in app_users: ${profile.email}, syncing...`);
        
        // Auto-sync this user to app_users
        await syncUserToAppUsers(profile.id, profile.email, profile.full_name || profile.email);
        
        // Determine role based on email - new users get 'worker' role by default
        const role = (profile.email === 'juan.casanova@skyranch.com' || profile.email === 'jvcas@mac.com') 
          ? 'admin' 
          : 'worker';

        allUsers.push({
          id: profile.id,
          name: profile.full_name || profile.email,
          email: profile.email,
          role: role,
          created_at: profile.created_at,
          is_active: true,
          created_by: undefined
        });
        
        userEmails.add(profile.email);
      }
    }
  }

  console.log('Total users returned:', allUsers.length);
  return allUsers;
};

export const syncUserToAppUsers = async (profileId: string, email: string, fullName: string): Promise<void> => {
  console.log(`Attempting to sync user: ${email}`);
  
  // Check if user already exists in app_users
  const { data: existingUser, error: checkError } = await supabase
    .from('app_users')
    .select('id')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing user:', checkError);
    return;
  }

  if (!existingUser) {
    // Determine role based on email - new users get 'worker' role by default
    const role = (email === 'juan.casanova@skyranch.com' || email === 'jvcas@mac.com') 
      ? 'admin' 
      : 'worker';

    console.log(`Syncing new user to app_users: ${email} with role: ${role}`);

    // Add to app_users table
    const { error } = await supabase
      .from('app_users')
      .insert([{
        id: profileId,
        name: fullName || email,
        email: email,
        role: role,
        is_active: true
      }]);

    if (error) {
      console.error('Error syncing user to app_users:', error);
    } else {
      console.log(`User ${email} successfully synced to app_users table`);
    }
  } else {
    console.log(`User ${email} already exists in app_users table`);
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
  const { error } = await supabase
    .from('app_users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting user:', error);
    throw error;
  }

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
  
  if (!user) return null;

  // First try to find in app_users
  const { data: appUser, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (appUser) {
    return {
      ...appUser,
      role: appUser.role as 'admin' | 'manager' | 'worker'
    };
  }

  // If not found in app_users, check profiles and sync
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile && profile.email) {
    // Sync to app_users
    await syncUserToAppUsers(profile.id, profile.email, profile.full_name || profile.email);
    
    // Return user data
    const role = (profile.email === 'juan.casanova@skyranch.com' || profile.email === 'jvcas@mac.com') 
      ? 'admin' 
      : 'worker';

    return {
      id: profile.id,
      name: profile.full_name || profile.email,
      email: profile.email,
      role: role,
      created_at: profile.created_at,
      is_active: true
    };
  }

  return null;
};


import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Singleton pattern for admin client to prevent multiple instances
let supabaseAdmin: any = null;

const getAdminClient = () => {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      "https://ahwhtxygyzoadsmdrwwg.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFod2h0eHlneXpvYWRzbWRyd3dnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTEyMjE3MywiZXhwIjoyMDY0Njk4MTczfQ.-2GT6YJ6M4JHuTaBUm_aauPGDVapjjUdwgVKyGUfcag",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return supabaseAdmin;
};

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
  try {
    const { data: appUsers, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching app users:', error);
      return [];
    }

    return appUsers?.map(user => ({
      ...user,
      role: user.role as 'admin' | 'manager' | 'worker'
    })) || [];
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    return [];
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
  try {
    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};

export const toggleUserStatus = async (id: string): Promise<AppUser> => {
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
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: appUser, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !appUser) {
      return null;
    }

    return {
      ...appUser,
      role: appUser.role as 'admin' | 'manager' | 'worker'
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
};

export const syncUserToAppUsers = async (profileId: string, email: string, fullName: string): Promise<void> => {
  try {
    const { data: existingUser } = await supabase
      .from('app_users')
      .select('role')
      .eq('id', profileId)
      .single();

    let role: 'admin' | 'manager' | 'worker';
    
    if (existingUser) {
      role = existingUser.role as 'admin' | 'manager' | 'worker';
    } else {
      role = (email === 'juan.casanova@skyranch.com' || email === 'jvcas@mac.com') 
        ? 'admin' 
        : 'worker';
    }

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
      console.error('Error upserting user:', error);
    }
  } catch (error) {
    console.error('Error in syncUserToAppUsers:', error);
  }
};

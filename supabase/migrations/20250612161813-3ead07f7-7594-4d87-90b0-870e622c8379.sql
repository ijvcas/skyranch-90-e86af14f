
-- Add phone column to app_users table
ALTER TABLE public.app_users 
ADD COLUMN phone text;

-- Create a function to sync all auth users to app_users table
CREATE OR REPLACE FUNCTION sync_auth_users_to_app_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert missing users from auth.users into app_users
  INSERT INTO public.app_users (id, name, email, role, is_active, created_by, phone)
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as name,
    au.email,
    'worker' as role,
    true as is_active,
    au.id as created_by,
    COALESCE(au.raw_user_meta_data->>'phone', '') as phone
  FROM auth.users au
  LEFT JOIN public.app_users apu ON au.id = apu.id
  WHERE apu.id IS NULL
    AND au.email IS NOT NULL
    AND au.email_confirmed_at IS NOT NULL;
END;
$$;

-- Run the sync function to add missing users
SELECT sync_auth_users_to_app_users();

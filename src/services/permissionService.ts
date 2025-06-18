
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/services/userService';

export type Permission = 
  | 'animals_view' | 'animals_edit' | 'animals_delete' | 'animals_create'
  | 'lots_manage' | 'health_records' | 'breeding_records' | 'calendar_manage'
  | 'users_manage' | 'system_settings';

export type UserRole = 'admin' | 'manager' | 'worker';

// Permission mappings for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'animals_view', 'animals_edit', 'animals_delete', 'animals_create',
    'lots_manage', 'health_records', 'breeding_records', 'calendar_manage',
    'users_manage', 'system_settings'
  ],
  manager: [
    'animals_view', 'animals_edit', 'animals_create',
    'lots_manage', 'health_records', 'breeding_records', 'calendar_manage'
  ],
  worker: [
    'animals_view', 'animals_edit', 'health_records', 'breeding_records'
  ]
};

export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;
    
    return currentUser.role as UserRole;
  } catch (error) {
    console.error('Error getting current user role:', error);
    return null;
  }
};

export const hasPermission = async (permission: Permission): Promise<boolean> => {
  try {
    const userRole = await getCurrentUserRole();
    if (!userRole) return false;
    
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export const checkPermission = async (permission: Permission): Promise<void> => {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error(`Acceso denegado: No tienes permisos para ${permission}`);
  }
};

export const requirePermission = (permission: Permission) => {
  return async (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      await checkPermission(permission);
      return method.apply(this, args);
    };
  };
};

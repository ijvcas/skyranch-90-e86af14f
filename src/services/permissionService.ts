
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
    console.log('🔍 Getting current user role...');
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ No current user found');
      return null;
    }
    
    console.log('✅ Current user role:', currentUser.role);
    return currentUser.role as UserRole;
  } catch (error) {
    console.error('❌ Error getting current user role:', error);
    return null;
  }
};

export const hasPermission = async (permission: Permission): Promise<boolean> => {
  try {
    console.log('🔍 Checking permission:', permission);
    const userRole = await getCurrentUserRole();
    
    if (!userRole) {
      console.log('❌ No user role found, defaulting to no permission');
      return false;
    }
    
    const rolePermissions = ROLE_PERMISSIONS[userRole];
    const hasAccess = rolePermissions.includes(permission);
    
    console.log(`${hasAccess ? '✅' : '❌'} Permission check result:`, {
      permission,
      userRole,
      hasAccess
    });
    
    return hasAccess;
  } catch (error) {
    console.error('❌ Error checking permission:', error);
    return false;
  }
};

export const checkPermission = async (permission: Permission): Promise<void> => {
  const allowed = await hasPermission(permission);
  if (!allowed) {
    const userRole = await getCurrentUserRole();
    const errorMessage = userRole 
      ? `Acceso denegado: Tu rol '${userRole}' no tiene permisos para ${permission}`
      : `Acceso denegado: No se pudo determinar tu rol de usuario para ${permission}`;
    throw new Error(errorMessage);
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

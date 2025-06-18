
import { useState, useEffect } from 'react';
import { Permission, UserRole, getCurrentUserRole, hasPermission } from '@/services/permissionService';

export const usePermissions = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await getCurrentUserRole();
        setUserRole(role);
      } catch (error) {
        console.error('Error loading user role:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, []);

  const checkPermission = async (permission: Permission): Promise<boolean> => {
    return await hasPermission(permission);
  };

  return {
    userRole,
    loading,
    checkPermission,
    hasPermission: (permission: Permission) => hasPermission(permission)
  };
};

export const usePermissionCheck = (permission: Permission) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const allowed = await hasPermission(permission);
        setHasAccess(allowed);
      } catch (error) {
        console.error('Error checking permission:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [permission]);

  return { hasAccess, loading };
};

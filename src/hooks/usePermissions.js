import useAdminAuth from './useAdminAuth.js';
import { hasPermission } from '../config/permissions.js';
import { useCallback } from 'react';

export default function usePermissions() {
  const { admin, isSuperAdmin } = useAdminAuth();

  const check = useCallback((permission) => {
    if (isSuperAdmin) return true;
    return hasPermission(admin, permission);
  }, [admin, isSuperAdmin]);

  return {
    can: check,
    admin,
    isSuperAdmin,
  };
}

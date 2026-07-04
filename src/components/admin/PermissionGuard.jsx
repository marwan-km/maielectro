import usePermissions from '../../hooks/usePermissions.js';

export default function PermissionGuard({ permission, children, fallback = null }) {
  const { can } = usePermissions();

  if (can(permission)) {
    return children;
  }

  return fallback;
}

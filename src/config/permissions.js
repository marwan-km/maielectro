export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  PRODUCTS_IMAGES_UPLOAD: 'products.images.upload',
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_CREATE: 'categories.create',
  CATEGORIES_UPDATE: 'categories.update',
  CATEGORIES_DELETE: 'categories.delete',
  STOCK_VIEW: 'stock.view',
  STOCK_UPDATE: 'stock.update',
  REPAIR_SERVICES_VIEW: 'repair_services.view',
  REPAIR_SERVICES_CREATE: 'repair_services.create',
  REPAIR_SERVICES_UPDATE: 'repair_services.update',
  REPAIR_SERVICES_DELETE: 'repair_services.delete',
  ADMIN_USERS_MANAGE: 'admin_users.manage',
  ADMINS_MANAGE: 'admins.manage',
  PASSWORD_UPDATE_ADMIN: 'password.update_admin',
  ROLE_MANAGE: 'role.manage',
  ADMINS_VIEW: 'admins.view',
  ADMINS_CREATE: 'admins.create',
  ADMINS_UPDATE: 'admins.update',
  ADMINS_DELETE: 'admins.delete',
  ADMINS_ROLES_UPDATE: 'admins.roles.update',
  ADMINS_PASSWORD_RESET: 'admins.password.reset',
  LOGS_VIEW_ALL: 'logs.view_all',
  LOGS_VIEW_OWN: 'logs.view_own',
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
};

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.PRODUCTS_IMAGES_UPLOAD,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_UPDATE,
    PERMISSIONS.REPAIR_SERVICES_VIEW,
    PERMISSIONS.REPAIR_SERVICES_CREATE,
    PERMISSIONS.REPAIR_SERVICES_UPDATE,
    PERMISSIONS.REPAIR_SERVICES_DELETE,
    PERMISSIONS.LOGS_VIEW_OWN,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_UPDATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.REPAIR_SERVICES_VIEW,
    PERMISSIONS.REPAIR_SERVICES_CREATE,
    PERMISSIONS.REPAIR_SERVICES_UPDATE,
    PERMISSIONS.REPAIR_SERVICES_DELETE,
    PERMISSIONS.LOGS_VIEW_OWN,
    PERMISSIONS.PRODUCTS_IMAGES_UPLOAD,
  ],
  editor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.REPAIR_SERVICES_VIEW,
    PERMISSIONS.REPAIR_SERVICES_CREATE,
    PERMISSIONS.REPAIR_SERVICES_UPDATE,
    PERMISSIONS.REPAIR_SERVICES_DELETE,
    PERMISSIONS.PRODUCTS_IMAGES_UPLOAD,
  ],
  stock_manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_UPDATE,
  ],
  viewer: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
  ],
};

const PERMISSION_VALUES_BY_NAME = Object.fromEntries(Object.entries(PERMISSIONS));
const PERMISSION_NAMES_BY_VALUE = Object.fromEntries(
  Object.entries(PERMISSIONS).map(([name, value]) => [value, name])
);

const normalizePermission = (permission) => PERMISSION_VALUES_BY_NAME[permission] || permission;

const isGranted = (value) => value === true || value === 'true';

const normalizePermissionsJson = (permissions) => {
  if (!permissions) return {};
  if (Array.isArray(permissions)) {
    return Object.fromEntries(permissions.map((permission) => [permission, true]));
  }
  if (typeof permissions === 'string') {
    try {
      return normalizePermissionsJson(JSON.parse(permissions));
    } catch {
      return { [permissions]: true };
    }
  }
  if (typeof permissions === 'object') return permissions;
  return {};
};

const hasExplicitPermissionGrant = (permissions, permission) => {
  const normalizedPermissions = normalizePermissionsJson(permissions);
  const permissionValue = normalizePermission(permission);
  const permissionName = PERMISSION_NAMES_BY_VALUE[permissionValue] || permission;
  return isGranted(normalizedPermissions[permissionValue]) || isGranted(normalizedPermissions[permissionName]);
};

export const hasPermission = (admin, permission) => {
  if (!admin || !admin.role) return false;
  const role = String(admin.role).trim().toLowerCase();
  if (role === 'super_admin') return true;

  const permissionValue = normalizePermission(permission);
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permissionValue) || hasExplicitPermissionGrant(admin.permissions, permissionValue);
};

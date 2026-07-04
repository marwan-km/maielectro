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
    PERMISSIONS.PRODUCTS_IMAGES_UPLOAD,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_CREATE,
    PERMISSIONS.CATEGORIES_UPDATE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_UPDATE,
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
    PERMISSIONS.LOGS_VIEW_OWN,
    PERMISSIONS.PRODUCTS_IMAGES_UPLOAD,
  ],
  editor: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_UPDATE,
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

export const hasPermission = (admin, permission) => {
  if (!admin || !admin.role) return false;
  if (admin.role === 'super_admin') return true;
  
  // Custom permissions overrides
  if (admin.permissions && admin.permissions[permission] !== undefined) {
    return admin.permissions[permission];
  }
  
  const rolePerms = ROLE_PERMISSIONS[admin.role] || [];
  return rolePerms.includes(permission);
};

export const SUPER_ADMIN_EMAIL = 'kirammarwan@gmail.com';

export function isAllowedSuperAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === SUPER_ADMIN_EMAIL;
}

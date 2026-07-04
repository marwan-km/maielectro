export function formatAdminDate(value, options) {
  if (!value) return 'Date non disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date non disponible';
  return date.toLocaleString('fr-FR', options);
}

export function formatAdminDateOnly(value) {
  return formatAdminDate(value, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

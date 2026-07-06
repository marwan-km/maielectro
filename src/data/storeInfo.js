export const storeInfo = {
  name: 'MaiElectro',
  type: 'Electronics and laptop shop in Casablanca',
  address: 'Derb Ghallef',
  locationName: 'Derb Ghallef',
  phone: '0725952161',
  whatsapp: '212725952161',
  hours: '10h00 - 20h30',
  email: 'contact@maielectro.com',
  socials: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
    youtube: '#',
  },
};

const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

const isRealPhoneNumber = (value) => normalizeDigits(value).length >= 9;

export const phoneLink = () => {
  const digits = normalizeDigits(storeInfo.phone);
  return isRealPhoneNumber(digits) ? `tel:${digits}` : '#';
};

export const whatsappNumber = () => {
  const digits = normalizeDigits(storeInfo.whatsapp);
  if (!digits) return '';
  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0')) return `212${digits.slice(1)}`;
  return digits;
};

export const whatsappLink = (message = 'Bonjour MaiElectro, je veux plus d informations.') => {
  const number = whatsappNumber();
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : '#';
};

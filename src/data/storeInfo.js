export const storeInfo = {
  name: 'MaiElectro',
  type: 'Electronics and laptop shop in Casablanca',
  address: 'Derb Ghallef',
  locationName: 'Derb Ghallef',
  phone: '06XXXXXXXXXX',
  whatsapp: '06XXXXXXXXXX',
  hours: '10h00 - 20h30',
  email: 'contact@maielectro.com',
  socials: {
    facebook: '#',
    instagram: '#',
    tiktok: '#',
    youtube: '#',
  },
};

const isRealPhoneNumber = (value) => /^\d+$/.test(value);

export const phoneLink = () => (isRealPhoneNumber(storeInfo.phone) ? `tel:${storeInfo.phone}` : '#');

export const whatsappLink = (message = 'Bonjour MaiElectro, je veux plus d informations.') =>
  isRealPhoneNumber(storeInfo.whatsapp)
    ? `https://wa.me/${storeInfo.whatsapp}?text=${encodeURIComponent(message)}`
    : '#';

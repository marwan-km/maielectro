import { Cpu, Headphones, Laptop, Smartphone } from 'lucide-react';

// Only PRODUCT categories that have real products and use the product grid.
// Réparation and Blog are service/content pages with their own routes — NOT product categories.
const CATEGORY_PLACEHOLDER_IMAGE = '/images/fallback-product.svg';

export const categories = [
  {
    id: 'laptops',
    nameKey: 'navLaptops',
    name: 'PC Portable',
    path: '/category/laptops',
    image: CATEGORY_PLACEHOLDER_IMAGE,
    icon: Laptop,
    description: 'Tous les laptops Lenovo, Dell, HP et MacBook disponibles chez MaiElectro.',
    children: [
      { id: 'all-laptops', name: 'Tous les PC Portables', path: '/category/laptops' },
      { id: 'lenovo', name: 'Lenovo', path: '/category/lenovo' },
      { id: 'dell', name: 'Dell', path: '/category/dell' },
      { id: 'hp', name: 'HP', path: '/category/hp' },
      { id: 'macbook', name: 'MacBook', path: '/category/macbook' },
    ],
  },
  {
    id: 'pieces-detachees',
    nameKey: 'navPieces',
    name: 'Pièces détachées',
    path: '/category/pieces-detachees',
    image: CATEGORY_PLACEHOLDER_IMAGE,
    icon: Cpu,
    description: 'SSD, RAM, écrans, batteries, claviers, cartes mères et composants compatibles.',
    children: [
      { id: 'all-spares', name: 'Toutes les pièces', path: '/category/pieces-detachees' },
      { id: 'spares-screens', name: 'Écrans', path: '/category/pieces-detachees?search=ecran' },
      { id: 'spares-batteries', name: 'Batteries', path: '/category/pieces-detachees?search=batterie' },
      { id: 'spares-keyboards', name: 'Claviers', path: '/category/pieces-detachees?search=clavier' },
      { id: 'spares-chargers', name: 'Chargeurs', path: '/category/pieces-detachees?search=chargeur' },
      { id: 'spares-ssd-ram', name: 'SSD / RAM', path: '/category/pieces-detachees?search=ssd' },
    ],
  },
  { id: 'accessoires', nameKey: 'navAccessoires', name: 'Accessoires', path: '/category/accessoires', image: CATEGORY_PLACEHOLDER_IMAGE, icon: Headphones, description: 'Chargeurs, souris, claviers, casques, sacoches et hubs USB-C.', children: [] },
  { id: 'iphone', nameKey: 'navIphone', name: 'iPhone', path: '/category/iphone', image: CATEGORY_PLACEHOLDER_IMAGE, icon: Smartphone, description: 'iPhones contrôlés, accessoires compatibles et demande de disponibilité.', children: [] },
];

export const categoryById = Object.fromEntries(categories.map((category) => [category.id, category]));

export const categoryMeta = {
  ...categoryById,
  macbook: { id: 'macbook', name: 'MacBook', description: 'MacBook Air et MacBook Pro préparés avec garantie boutique.' },
  lenovo: { id: 'lenovo', name: 'Lenovo', description: 'ThinkPad, ThinkBook, Yoga, IdeaPad et Legion disponibles à Casablanca.' },
  dell: { id: 'dell', name: 'Dell', description: 'Latitude, XPS, Precision, Vostro et Inspiron avec garantie.' },
  hp: { id: 'hp', name: 'HP', description: 'EliteBook, ProBook, ZBook, Spectre et Pavilion prêts à utiliser.' },
};

export const brands = ['Lenovo', 'Dell', 'HP', 'Apple', 'Logitech', 'Samsung', 'Kingston', 'MaiElectro'];

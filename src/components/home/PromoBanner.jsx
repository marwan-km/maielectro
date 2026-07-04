import CategoryShortcutCard from './CategoryShortcutCard.jsx';

const promos = [
  {
    title: 'Lenovo',
    text: 'à partir de 1900 DH',
    link: '/shop?brand=Lenovo',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/lenovo-thinkpad-l14-i711eme-16512-occasion-main.jpg',
  },
  {
    title: 'MacBook',
    text: 'Office + Adobe inclus',
    link: '/shop?brand=Apple',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/macbook-air-m2-15-pouce-8gb-ram-256-ssd-main.jpg',
  },
  {
    title: 'HP',
    text: 'garantie 6 mois',
    link: '/shop?brand=HP',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/hp-envy-x360-i512eme-8512-occasion-main.jpg',
  },
  {
    title: 'Dell',
    text: 'business laptops',
    link: '/shop?brand=Dell',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/laptops/dell-latitude-5430-i5-14-pouce-12th-generation-8gb-ram-256-ssd-main.jpg',
  },
  {
    title: 'Accessoires',
    text: 'jusqu à -15%',
    link: '/category/accessoires',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/accessoires/sac-a-dos-ordinateur-portable-main.jpg',
  },
  {
    title: 'Réparation',
    text: 'diagnostic rapide',
    link: '/reparation',
    image: '/images/repair/hero-repair.jpg',
  },
  {
    title: 'Pièces détachées',
    text: 'SSD, RAM, écrans',
    link: '/category/pieces-detachees',
    image: 'https://yvlnjsttvnsyrgtsarvy.supabase.co/storage/v1/object/public/product-images/products/pieces-detachees/clavier-macbook-air-m2-15-pouces-2023-main.jpg',
  },
];

export default function PromoBanner() {
  return (
    <section className="container-shell relative z-10 -mt-4 overflow-x-clip pb-16 sm:-mt-6 lg:pb-20">
      <div className="grid min-w-0 gap-5 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] lg:gap-6">
        {promos.map((promo) => <CategoryShortcutCard key={promo.title} {...promo} />)}
      </div>
    </section>
  );
}

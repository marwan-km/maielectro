import { Button as HeroButton } from '@heroui/react/button';
import { useNavigate } from 'react-router-dom';

const variants = {
  primary:   'bg-gray-900 text-white hover:bg-gray-700 shadow-sm active:scale-[0.98] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white',
  secondary: 'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
  dark:      'bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900',
  promo:     'bg-green-500/90 text-white hover:bg-green-500 shadow-sm shadow-green-500/20',
  danger:    'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  whatsapp:  'bg-green-500/90 text-white hover:bg-green-500 shadow-sm shadow-green-500/20',
};

export default function Button({ children, to, href, variant = 'primary', className = '', ...props }) {
  const navigate = useNavigate();
  const { target, rel, onClick, disabled, ...buttonProps } = props;
  const base = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] ${variants[variant] || variants.primary} ${className}`;

  const handlePress = (event) => {
    onClick?.(event);
    if (event?.defaultPrevented) return;
    if (to) navigate(to);
    if (href) window.open(href, target || '_self', rel ? 'noreferrer' : undefined);
  };

  return (
    <HeroButton className={base} isDisabled={disabled} onPress={handlePress} {...buttonProps}>
      {children}
    </HeroButton>
  );
}

import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../data/storeInfo.js';
import { useI18n } from '../../i18n/I18nContext.jsx';

export default function WhatsAppButton() {
  const { t } = useI18n();

  return (
    <a
      href={whatsappLink('Bonjour MaiElectro, je veux passer une commande.')}
      target="_blank"
      rel="noreferrer"
      aria-label={t('orderWhatsApp')}
      title="Commander sur WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-green-500/90 text-white shadow-lg shadow-green-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-500 hover:shadow-xl hover:shadow-green-600/25 rtl:left-6 rtl:right-auto"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

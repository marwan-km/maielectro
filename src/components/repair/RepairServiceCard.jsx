import { MessageCircle } from 'lucide-react';
import { Card } from '@heroui/react/card';
import SafeImage from '../ui/SafeImage.jsx';
import { whatsappLink } from '../../data/storeInfo.js';

export default function RepairServiceCard({ service, repairMessage }) {
  const whatsappMessage = service.whatsappMessage || repairMessage;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="h-[180px] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <SafeImage
          src={service.image}
          alt={service.title}
          className="h-full w-full"
          imageClassName={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${
            service.imageFit === 'contain' ? 'object-contain p-4' : 'object-cover'
          }`}
        />
      </div>
      <div className="flex h-full flex-col p-5">
        <h3 className="text-base font-black text-gray-900 dark:text-white">{service.title}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500 dark:text-gray-400">{service.description}</p>
        <span className="mt-4 inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
          {service.priceLabel}
        </span>
        <a
          href={whatsappLink(whatsappMessage)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-500/90 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-500"
        >
          <MessageCircle className="h-4 w-4" /> Contacter sur WhatsApp
        </a>
      </div>
    </Card>
  );
}

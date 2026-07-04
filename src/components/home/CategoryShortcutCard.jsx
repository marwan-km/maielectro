import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@heroui/react/card';

const fallbackImage = '/images/categories/laptops-real.jpg';

function CategoryShortcutCard({ title, text, link, image }) {
  const [src, setSrc] = useState(image || fallbackImage);

  return (
    <Card className="group h-[286px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <Link to={link} className="flex h-full min-w-0 flex-col" aria-label={title}>
        <div className="flex h-[170px] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900">
          <img
            src={src}
            alt=""
            width="320"
            height="180"
            loading="lazy"
            decoding="async"
            onError={() => setSrc(fallbackImage)}
            className="h-full w-full object-contain object-center p-2 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        </div>
        <Card.Content className="flex min-h-0 flex-1 flex-col justify-center p-0 pt-5">
          <h3 className="line-clamp-2 text-xl font-black leading-tight text-gray-900 transition-colors group-hover:text-gray-600 dark:text-white dark:group-hover:text-gray-300">
            {title}
          </h3>
          <p className="line-clamp-2 mt-1.5 text-sm font-medium leading-5 text-gray-500 dark:text-gray-400">
            {text}
          </p>
        </Card.Content>
      </Link>
    </Card>
  );
}

export default memo(CategoryShortcutCard);

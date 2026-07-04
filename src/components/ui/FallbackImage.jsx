import { useEffect, useState } from 'react';

const fallback = '/images/fallback-product.svg';

export default function FallbackImage({ src, alt = '', fallbackSrc = fallback, className = '', imageClassName = '', priority = false }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src, fallbackSrc]);

  return (
    <div className={`grid place-items-center overflow-hidden bg-slate-50 dark:bg-slate-900 ${className}`}>
      <img
        src={failed || !src ? fallbackSrc : src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width="640"
        height="420"
        onError={() => setFailed(true)}
        className={`h-full w-full object-contain ${imageClassName}`}
      />
    </div>
  );
}

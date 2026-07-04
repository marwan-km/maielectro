import { useEffect, useState } from 'react';

const DEFAULT_FALLBACK = '/images/fallback-product.svg';

export default function SafeImage({
  src,
  alt = '',
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  imageClassName = '',
  priority = false,
  onBroken,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src, fallbackSrc]);

  const imageSrc = failed || !src ? fallbackSrc : src;

  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#ffffff,#f1f5f9_72%)] dark:bg-[radial-gradient(circle_at_50%_18%,#1f2937,#0d1117_72%)] ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => {
          if (failed) return;
          if (src && src !== fallbackSrc) onBroken?.(src);
          setFailed(true);
        }}
        width="640"
        height="420"
        className={`h-full w-full object-cover transition-transform duration-500 ${imageClassName}`}
      />
    </div>
  );
}

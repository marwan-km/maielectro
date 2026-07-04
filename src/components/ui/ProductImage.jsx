import { useState } from 'react';
import { FALLBACK_PRODUCT_IMAGE } from '../../services/productService.js';

export default function ProductImage({ src, alt, className = '', imageClassName = '', priority = false }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed || !src ? FALLBACK_PRODUCT_IMAGE : src;

  return (
    <div className={`relative overflow-hidden bg-[radial-gradient(circle_at_50%_18%,#ffffff,#f1f5f9_72%)] dark:bg-[radial-gradient(circle_at_50%_18%,#1f2937,#0d1117_72%)] ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onError={() => setFailed(true)}
        width="520"
        height="360"
        className={`h-full w-full object-contain transition-transform duration-500 ${imageClassName}`}
      />
    </div>
  );
}

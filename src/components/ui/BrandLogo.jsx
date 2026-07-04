import { useState } from 'react';

/**
 * BrandLogo — reusable component for MaiElectro branding.
 *
 * Behaviour:
 *  - If logo image exists  → shows the image at a readable size.
 *    When the image loads successfully, the text is hidden (the logo already
 *    contains the brand name).  On mobile the logo is shown at a smaller size.
 *  - If logo image fails   → falls back to the ME badge + "MaiElectro" text.
 *
 * Props:
 *  size     : 'sm' | 'md' | 'lg'  (default 'md')
 *  subtitle : optional string shown below the text (only in fallback mode)
 *  tone     : 'auto' | 'light' | 'dark' surface choice for the logo variant
 *  className: extra class names on the wrapper
 */

const LOGO_SRC = '/logo/maielectro.png';

// Heights for the logo image depending on `size` prop
const imgHeightMap = {
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-12',
};

// Badge + text sizes used in fallback mode
const fallbackSizeMap = {
  sm: { badge: 'h-8 w-8 text-sm', text: 'text-base', sub: 'text-[9px]' },
  md: { badge: 'h-10 w-10 text-lg', text: 'text-lg', sub: 'text-[10px]' },
  lg: { badge: 'h-12 w-12 text-xl', text: 'text-xl', sub: 'text-xs' },
};

export default function BrandLogo({ size = 'md', subtitle = '', tone = 'auto', className = '' }) {
  const [imgFailed, setImgFailed] = useState(false);
  const imgH   = imgHeightMap[size]  || imgHeightMap.md;
  const fb     = fallbackSizeMap[size] || fallbackSizeMap.md;
  const shellClass = tone === 'dark'
    ? `flex items-center ${className}`
    : `flex items-center rounded-2xl bg-white p-1 shadow-sm ${className}`;

  if (!imgFailed) {
    return (
      <div className={shellClass}>
        <img
          src={LOGO_SRC}
          alt="MaiElectro logo"
          className={`${imgH} w-auto max-w-[180px] object-contain`}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  /* ── Fallback: ME badge + text ────────────────────────────────────── */
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`grid ${fb.badge} shrink-0 place-items-center rounded-xl ${tone === 'dark' ? 'bg-white text-gray-900' : 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'} font-black`}
        aria-hidden="true"
      >
        ME
      </div>
      <div className="hidden sm:block">
        <p className={`${fb.text} font-black leading-tight ${tone === 'dark' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>MaiElectro</p>
        {subtitle && (
          <p className={`${fb.sub} font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

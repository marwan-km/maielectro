import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { translations } from './translations.js';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem('maielectro-lang') || 'fr'; }
    catch { return 'fr'; }
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try { localStorage.setItem('maielectro-lang', newLang); } catch {}
  }, []);

  useEffect(() => {
    const dir = translations[lang]?.dir || 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations.fr[key] || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir: translations[lang]?.dir || 'ltr' }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);

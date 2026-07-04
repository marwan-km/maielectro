import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProductDataProvider } from './context/ProductDataContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';
import HeroUIProvider from './components/ui/HeroUIProvider.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <ThemeProvider>
          <I18nProvider>
            <ProductDataProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </ProductDataProvider>
          </I18nProvider>
        </ThemeProvider>
      </HeroUIProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

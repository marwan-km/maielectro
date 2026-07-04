import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@heroui') || id.includes('framer-motion')) {
            return 'vendor-heroui';
          }
          if (id.includes('@react-aria') || id.includes('@react-stately') || id.includes('react-aria-components')) {
            return 'vendor-aria';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }
          if (id.includes('react') || id.includes('scheduler')) {
            return 'vendor-react';
          }
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          return undefined;
        },
      },
    },
  },
});

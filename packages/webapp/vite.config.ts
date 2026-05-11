import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { createManualChunks } from '../../tools/vite/manualChunks';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: createManualChunks({
          react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
          query: ['@tanstack'],
          apollo: ['@apollo', 'graphql', 'graphql-ws'],
          mui: ['@mui', '@emotion', 'notistack', 'material-ui-confirm'],
          utils: ['date-fns', 'pluralize'],
          flags: ['react-flag-icon-css'],
        }),
      },
    },
  },
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate', devOptions: {
      enabled: true
    }
  })],
});

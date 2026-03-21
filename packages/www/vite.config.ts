import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createManualChunks } from '../../tools/vite/manualChunks';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: createManualChunks({
          react: ['react', 'react-dom', 'react-router', 'react-router-dom'],
          query: ['@tanstack'],
          apollo: ['@apollo', 'graphql', 'graphql-ws', 'apollo-link-scalars'],
          ui: ['notistack', 'styled-components', 'react-bulma-components', 'react-phone-number-input', 'react-spinners'],
        }),
      },
    },
  },
  plugins: [react()],
});

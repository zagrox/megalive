import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: true, 
      strictPort: true,
      port: 5173,
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.DIRECTUS_CRM_URL': JSON.stringify(env.VITE_DIRECTUS_CRM_URL),
    },
  };
});
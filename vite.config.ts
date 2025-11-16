import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    server: {
      host: true, // This is crucial for VPS to expose the server to the network
      strictPort: true,
      port: 5173,
    },
    define: {
      // Replaces process.env.API_KEY in the client code with the actual value at build/runtime
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
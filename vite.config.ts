import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cookie-command/',
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['app-one.cookiecommand.ngrok.app', 'app-one.conversatrait.ngrok.app'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

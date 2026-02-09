import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cookie-command/', // GitHub Pages subpath
  server: {
    port: 5173,
    host: true, // Allow external access (needed for ngrok)
    // Add this line to allow your specific Ngrok URL:
    allowedHosts: ['app-one.cookiecommand.ngrok.app', 'app-one.conversatrait.ngrok.app'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
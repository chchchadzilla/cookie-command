import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/cookie-command/',
  server: {
    port: 5173,
    host: true, // Allow external access for local network testing
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

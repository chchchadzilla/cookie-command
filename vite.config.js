import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/', // Change to '/cookie-command/' if deploying to GitHub Pages under a subpath
    server: {
        port: 5173,
        host: true, // Allow external access (needed for ngrok)
        // Add this line to allow your specific Ngrok URL:
        allowedHosts: ['app-one.cookiecommand.ngrok.app'],
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
});

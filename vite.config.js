import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Bind to both IPv4 (127.0.0.1) and IPv6 (::1)
    port: 3000,
    strictPort: true,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true
  }
});

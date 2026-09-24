import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Exposes on localhost (127.0.0.1 and ::1) and local network
    port: 3000,
    open: false
  },
  preview: {
    host: true,
    port: 3000
  }
});

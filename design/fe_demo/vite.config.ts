import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Allow opening dist/index.html directly without root path issues
  server: {
    port: 3000,
    open: true
  }
});

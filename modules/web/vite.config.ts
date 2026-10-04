import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2567';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': coreApiUrl },
  },
});

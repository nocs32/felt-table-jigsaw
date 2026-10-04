import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const coreApiUrl = 'http://localhost:2567';

// Live tables: the Colyseus client talks to /live (matchmaking over HTTP, then a WebSocket);
// core-api serves those routes at its root.
const liveProxy = {
  target: coreApiUrl,
  ws: true,
  rewrite: (path: string): string => path.replace(/^\/live/u, ''),
};

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      'styled-system': fileURLToPath(new URL('./styled-system', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: { '/api': coreApiUrl, '/live': liveProxy },
  },
  // `pnpm play`: the production build is served here and a Cloudflare Tunnel brings jigsaw.timnox.dev to it.
  // The preview reuses `server.proxy`, so /api and /live reach core-api exactly as in dev.
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    allowedHosts: ['jigsaw.timnox.dev'],
  },
});

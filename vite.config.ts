import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gas-proxy',
        configureServer(server) {
          server.middlewares.use('/api/gas-proxy', async (req, res) => {
            try {
              const urlObj = new URL(req.url!, 'http://localhost:3000');
              const targetUrl = urlObj.searchParams.get('url');
              if (!targetUrl) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Parameter url wajib diisi' }));
                return;
              }
              // Node.js fetch follows Google Apps Script 302 redirects automatically
              const gasRes = await fetch(targetUrl, {
                method: 'GET',
                redirect: 'follow',
                headers: {
                  'Accept': 'application/json',
                },
              });
              const text = await gasRes.text();
              res.setHeader('Content-Type', 'application/json');
              try {
                const json = JSON.parse(text);
                res.end(JSON.stringify(json));
              } catch {
                res.end(JSON.stringify({
                  success: false,
                  isHtml: true,
                  message: 'Google Apps Script mengembalikan halaman HTML Web App lama, bukan data JSON REST API.',
                  snippet: text.slice(0, 300),
                }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://poorly-real-ghoul.ngrok-free.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Tambahkan konfigurasi berikut:
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
        }
      }
    }
  }
})
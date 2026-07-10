import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/krdict': {
        target: 'https://krdict.korean.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/krdict/, '/api'),
      },
      '/libretranslate': {
        target: 'https://libretranslate.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/libretranslate/, ''),
      },
    },
  },
});

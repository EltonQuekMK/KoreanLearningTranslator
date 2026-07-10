import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Base path for GitHub Pages (project site). Adjust to your repo name.
  base: '/KoreanLearningTranslator/',
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

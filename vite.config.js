import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Игровой сервер — общий с vk-games-hub (npm run dev:server там, порт 3000).
// changeOrigin: false — сервер должен видеть настоящий Host, иначе запрос через туннель
// выглядел бы «локальным» и получил бы доступ к тестовому входу без подписи ВК.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.trycloudflare.com', '.lhr.life'],
    proxy: {
      '/socket.io': { target: 'http://localhost:3000', changeOrigin: false, ws: true },
    },
  },
});

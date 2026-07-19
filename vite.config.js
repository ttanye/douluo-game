import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/douluo-game/',
  plugins: [uni()],
  server: {
    port: 3002,
    strictPort: false,
  },
})

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // hash 路由用相对路径，部署到 GitHub Pages 子路径也能加载
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true, // 端口被占用时报错而非顺延，保证 OAuth 回调地址稳定
  },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { env } from "node:process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: env.API_PROXY_TARGET || "http://localhost:5800",
        changeOrigin: true,
      },
    },
  },
})

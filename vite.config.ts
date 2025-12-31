import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from "url"

// 🔧 Fix ESM (__dirname)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Host para Tauri HMR
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  clearScreen: false,

  server: {
    port: 5173,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 5173,
        }
      : undefined,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  envPrefix: ["VITE_", "TAURI_"],

  build: {
    target: ["es2021", "chrome100", "safari13"],
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})

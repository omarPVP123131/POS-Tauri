import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [
    react({
      devTarget: "es2022"
    }),
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
    target: "esnext",
    minify: !process.env.TAURI_DEBUG ? "terser" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        splash: path.resolve(__dirname, 'splash.html'),
      },
    },

    chunkSizeWarningLimit: 800,
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      '@tauri-apps/api',
      '@tauri-apps/plugin-shell',
      '@tauri-apps/plugin-global-shortcut'
    ],
  },
})
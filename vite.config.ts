import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc" // 🚀 20x más rápido que Babel
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
    react({
      // 🔥 Optimizaciones de React con SWC
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
    // 🚀 Pre-calentar archivos críticos
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/LoginPage.tsx',
        './src/layouts/DashboardLayout.tsx'
      ]
    }
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  envPrefix: ["VITE_", "TAURI_"],

  build: {
    target: "esnext", // 🚀 Código más moderno = más pequeño y rápido
    minify: !process.env.TAURI_DEBUG ? "terser" : false, // Terser comprime mejor
    sourcemap: !!process.env.TAURI_DEBUG,
    
    // 🔥 Configuración de Terser para máxima compresión
    terserOptions: {
      compress: {
        drop_console: !process.env.TAURI_DEBUG, // Elimina console.log en prod
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        passes: 2, // Dos pasadas de compresión
        unsafe_arrows: true,
        unsafe_methods: true,
        unsafe_proto: true
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false, // Elimina comentarios
        ecma: 2020
      }
    },

    // 🚀 Code splitting inteligente
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendors principales de React
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('react-router')) {
              return 'router-vendor'
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-vendor'
            }
            // Resto de dependencias
            return 'vendor'
          }
          
          // Separa las páginas en chunks individuales
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0].toLowerCase()
            return `page-${pageName}`
          }
          
          // Separa componentes grandes
          if (id.includes('/components/')) {
            return 'components'
          }
        },
        
        // 🔥 Nombres optimizados para caché
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          // Organizar por tipo de asset
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/woff2?|ttf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        }
      }
    },

    // ⚡ Configuración de chunks
    chunkSizeWarningLimit: 800, // Advertir si chunk > 800kb
    
    // 🚀 Optimización de CSS
    cssCodeSplit: true,
    cssMinify: true,

    // ⚡ Reportar tamaño comprimido
    reportCompressedSize: true,
    
    // 🔥 Inline pequeños assets como base64
    assetsInlineLimit: 4096, // 4kb
    
    // Optimizar output
    modulePreload: {
      polyfill: false // No incluir polyfill si no es necesario
    }
  },

  // 🚀 Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      'lucide-react',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs'
    ],
    exclude: [
      '@tauri-apps/api',
      '@tauri-apps/plugin-shell'
    ],
    esbuildOptions: {
      target: 'esnext'
    }
  },

  // ⚡ Caché más agresivo
  cacheDir: '.vite',

  // 🔥 Log level
  logLevel: process.env.TAURI_DEBUG ? 'info' : 'warn',

  // 🚀 Worker optimization
  worker: {
    format: 'es',
    plugins: () => []
  },

  // Configuración adicional para mejorar HMR
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})
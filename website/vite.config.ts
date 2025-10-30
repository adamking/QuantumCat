import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import viteCompression from "vite-plugin-compression";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024, // Only compress files > 1KB
      deleteOriginFile: false,
    }),
    // Brotli compression (better compression ratio)
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
    }),
    // Optimize images automatically
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      jpg: { quality: 80 },
      webp: { quality: 85, lossless: false },
      avif: false, // Disable AVIF to save build time
    }),
  ],
  base: "/QuantumCat/",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Target modern browsers for smaller bundle sizes
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // Disable CSS code splitting
    cssCodeSplit: false,
    // Use esbuild for CSS minification (faster)
    cssMinify: "esbuild",
    // Configure source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Report compressed size
    reportCompressedSize: true,
    // Advanced rollup options for better code splitting
    rollupOptions: {
      output: {
        // Optimize asset file names for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".");
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext ?? "")) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|eot|ttf|otf/i.test(ext ?? "")) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        // Compact output for smaller bundle size
        compact: true,
        // Use shorter variable names in production
        generatedCode: {
          constBindings: true,
          objectShorthand: true,
        },
      },
      // Tree-shaking optimizations
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
    },
    // Optimize dependencies with esbuild (fast and modern)
    minify: "esbuild",
    // Advanced esbuild minification options
    esbuild: {
      // Remove console logs and debugger statements in production
      drop: ["console", "debugger"],
      // Enable all minification features
      legalComments: "none",
      // Optimize for size over speed
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      // Target modern JS for smaller output
      target: "es2020",
      // Enable tree-shaking for better optimization
      treeShaking: true,
    },
    // Asset inlining threshold (4KB - smaller files inline, larger separate)
    assetsInlineLimit: 4096,
  },
  // Enable dependency pre-bundling optimization
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime", "wouter"],
    exclude: [],
    // Use esbuild for fast dependency optimization
    esbuildOptions: {
      target: "es2020",
    },
  },
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    // Enable HMR for better DX
    hmr: {
      overlay: true,
    },
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
  },
});

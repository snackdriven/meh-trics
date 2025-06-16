import path from "node:path";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Add bundle analyzer in analyze mode
    mode === "analyze" &&
      visualizer({
        filename: "dist/bundle-analysis.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "~backend/client": path.resolve(__dirname, "./client"),
      "~backend/task/types": path.resolve(__dirname, "./types/backend"),
      "~backend/habits/types": path.resolve(__dirname, "./types/backend"),
      "~backend/mood/types": path.resolve(__dirname, "./types/backend"),
      "~backend/calendar/types": path.resolve(__dirname, "./types/backend"),
      "~backend": path.resolve(__dirname, "../backend/encore.gen"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          utils: ["clsx", "tailwind-merge"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-select", "@radix-ui/react-checkbox"],
          confetti: ["canvas-confetti"],
        },
      },
    },
    // Performance budgets
    chunkSizeWarningLimit: 1000,
  },
}));

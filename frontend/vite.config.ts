import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
      "~backend/client": path.resolve(__dirname, "./client"),
      "~backend": path.resolve(__dirname, "../backend"),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "meh-trics",
        short_name: "meh-trics",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
      },
      strategies: "injectManifest",
      srcDir: ".",
      filename: "sw.ts",
    }),
  ],
  mode: "development",
  build: {
    minify: false,
  },
});

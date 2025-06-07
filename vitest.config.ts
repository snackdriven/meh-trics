import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend"),
      "~backend/client": path.resolve(__dirname, "frontend/client"),
      "~backend": path.resolve(__dirname, "backend"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  plugins: [react()],
});

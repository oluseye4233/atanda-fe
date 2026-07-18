import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: { outDir: path.resolve(__dirname, "dist") },
  server: {
    port: 5173,
    proxy: {
      // Proxy the real backend through the dev server so browser requests to
      // /v1/* are same-origin (localhost:5173). This lets the backend's
      // session cookie survive in dev — a direct cross-origin axios call to
      // https://api.atanda.ai would need the cookie to carry SameSite=None,
      // which the browser otherwise drops for cross-site requests, causing
      // every authenticated request after login to 401.
      "/v1": {
        target: "https://api.atanda.ai",
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: "localhost",
      },
    },
  },
});

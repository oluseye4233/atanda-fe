import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

/**
 * Serves `index.html` for directory paths inside `client/public` during dev.
 * Vite's public-dir middleware only serves exact file matches, so a request to
 * `/living-resume-oluseye-shay-amusa/` would otherwise fall through to the SPA
 * fallback and render the React NotFound page instead of the static HTML.
 * Cloudflare Workers static assets handle this natively via `html_handling`,
 * so this plugin only affects the dev server.
 */
function publicIndexHtmlPlugin(): Plugin {
  const publicDir = path.resolve(__dirname, "client/public");
  return {
    name: "public-index-html",
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? "").split("?")[0].split("#")[0];
          if (!url.endsWith("/")) return next();
          const filePath = path.join(publicDir, url);
          const indexFile = path.join(filePath, "index.html");
          if (fs.existsSync(indexFile) && fs.statSync(indexFile).isFile()) {
            res.setHeader("Content-Type", "text/html");
            fs.createReadStream(indexFile).pipe(res);
            return;
          }
          next();
        });
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), publicIndexHtmlPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname),
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

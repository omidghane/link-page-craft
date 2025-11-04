import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,                 // listen on 0.0.0.0
    port: 8080,
    watch: {
      usePolling: true,         // fixes file watch issues on Docker/Win
      interval: 1000,
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',        // or your host IP if accessing remotely
      clientPort: 8080,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

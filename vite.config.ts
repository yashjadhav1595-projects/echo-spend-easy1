// Polyfill crypto.getRandomValues for Vite/node (ESM compatible)
import crypto from 'crypto';
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = crypto;
  globalThis.crypto.getRandomValues = (arr: any) => crypto.randomFillSync(arr);
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': 'http://localhost:5174',
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

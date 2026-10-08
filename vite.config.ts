import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  base: process.env.VITE_BASE || "/TrailMate-AI/",
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/*", "ort/*"],
      manifest: {
        name: "TrailMate AI",
        short_name: "TrailMate",
        description: "Explore More. Scroll Less.",
        theme_color: "#174B3A",
        background_color: "#F7F7EE",
        display: "standalone",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,wasm,mjs}"],
        globIgnores: ["assets/*.wasm"],
        maximumFileSizeToCacheInBytes: 30000000,
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 1500 },
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// La app vive en https://gamitadiaz.github.io/cartas/, por eso todo cuelga de /cartas/.
export default defineConfig({
  base: "/cartas/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icono.svg"],
      manifest: {
        name: "Conteo: aprende a contar cartas",
        short_name: "Conteo",
        description: "Blackjack, estrategia básica y conteo Hi-Lo para practicar, sin apuestas.",
        lang: "es-MX",
        theme_color: "#0b1210",
        background_color: "#0b1210",
        display: "standalone",
        orientation: "portrait",
        start_url: "/cartas/",
        scope: "/cartas/",
        icons: [
          { src: "icono-192.png", sizes: "192x192", type: "image/png" },
          { src: "icono-512.png", sizes: "512x512", type: "image/png" },
          { src: "icono-mask.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      // Guarda toda la app en el celular para que abra sin internet.
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] },
    }),
  ],
});

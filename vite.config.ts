import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Allows tunnels (ngrok etc.) to reach the dev server despite their Host header.
    allowedHosts: true,
  },
});

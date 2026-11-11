import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    fs: {
      // App.jsx imports the real scriptable/*.js sources (as raw text) from the parent folder.
      allow: [".."]
    }
  }
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr"; // ← Add this import

export default defineConfig({
  plugins: [react(), svgr()], // ← Add svgr here
});

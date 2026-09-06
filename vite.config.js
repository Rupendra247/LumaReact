import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the app works on any subpath (e.g. GitHub Pages
  // project site at /LumaReact/) as well as a domain root.
  base: './',
  plugins: [react(), tailwindcss()],
})
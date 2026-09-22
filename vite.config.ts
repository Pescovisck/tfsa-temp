import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function spaFallbackPlugin(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      const distIndex = path.resolve(import.meta.dirname, 'dist/index.html')
      const dist404 = path.resolve(import.meta.dirname, 'dist/404.html')
      if (fs.existsSync(distIndex)) {
        fs.copyFileSync(distIndex, dist404)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallbackPlugin()],
})

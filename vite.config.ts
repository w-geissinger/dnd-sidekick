import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('dnd-data/data/items')) return 'dnd-data-items';
          if (id.includes('dnd-data/data/spells')) return 'dnd-data-spells';
          if (id.includes('dnd-data/data/backgrounds')) return 'dnd-data-backgrounds';
        },
      },
    },
  },
})

import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import AdmZip from 'adm-zip'
import { existsSync } from 'fs'

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    {
      name: 'zip-dist',
      closeBundle() {
        if (existsSync('dist')) {
          const zip = new AdmZip()
          zip.addLocalFolder('dist')
          zip.writeZip('dist/admin.zip')
        }
      },
    },
  ],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:4004',
    },
  },
  resolve: {
    alias: {
      '@bookshop/shared': resolve(__dirname, '../shared/src'),
      '#cds-models': resolve(__dirname, '../../@cds-models'),
    },
  },
})

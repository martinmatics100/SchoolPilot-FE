import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates service worker when new version is available
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'], // Assets to cache
      manifest: {
        name: 'SchoolPilot - School Management System',
        short_name: 'SchoolPilot',
        description: 'Complete school management solution for administrators, teachers, and parents',
        theme_color: '#1976D2',
        background_color: '#ffffff',
        display: 'standalone', // Makes app open in its own window, not browser tab
        orientation: 'any',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Cache strategies for different file types
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'], // Files to precache
        runtimeCaching: [
          {
            // Cache API responses for offline access
            urlPattern: /^https:\/\/api\.yourdomain\.com\/.*/i,
            handler: 'NetworkFirst', // Try network first, fallback to cache
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            // Cache images for offline viewing
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst', // Use cache first for better performance
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache font files
            urlPattern: /\.(?:woff|woff2|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 90 // 90 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true, // Enable PWA in development for testing
        type: 'module'
      }
    })
  ],
  base: '/schoolpilot/', // Important: This must match your deployed path on Netlify
  server: {
    port: 5173,
    open: '/schoolpilot'
  }
})
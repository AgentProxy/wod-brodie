import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: { compatibilityVersion: 4 },
  ssr: false,
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt', '@vercel/analytics/nuxt'],
  app: {
    head: {
      title: 'WODBrodie',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#111315' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Anton&family=Chivo+Mono:wght@300&family=Space+Grotesk:wght@400;500;600&display=swap',
        },
      ],
    },
  },
  css: ['~/assets/css/tokens.css'],
  pwa: {
    manifest: {
      name: 'WODBrodie',
      short_name: 'WODBrodie',
      description: 'A gym whiteboard and a competition clock in your pocket.',
      theme_color: '#111315',
      background_color: '#111315',
      display: 'standalone',
      orientation: 'any',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: '/',
    },
    devOptions: {
      enabled: true,
    },
  },
})

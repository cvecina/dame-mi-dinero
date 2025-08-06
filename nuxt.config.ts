import { NuxtLoadingIndicator } from './.nuxt/components.d';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  router: {
    options: {
      hashMode: false
    }
  },

  imports: {
    dirs: [
      'composables',
      'composables/account',
      // 'composables/tipos_hospital',
      // 'composables/hospital',
    ]
  },

  components: [
    { path: '~/components', pathPrefix: false },
    { path: '~/components/account', pathPrefix: false },

  ],

  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    // '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt'
    //'@nuxt/image',
  ],

  // i18n: {
  //   vueI18n: './i18n.config.ts' // if you are using custom path, default
  // },

  css: [
    "@/assets/css/main.css"
  ],

  build: {
  },

  colorMode: {
    preference: 'light', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
  },

  // Configuración PWA (usando @vite-pwa/nuxt)
  vitePwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    manifest: {
      name: 'Dame Mi Dinero',
      short_name: 'DameMiDinero',
      description: 'Aplicación para controlar gastos compartidos con amigos',
      theme_color: '#3A7CA5',
      background_color: '#F6F5F2',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      lang: 'es',
      categories: ['finance', 'productivity', 'utilities'],
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml'
        },
        {
          src: '/favicon.ico',
          sizes: '32x32',
          type: 'image/x-icon'
        }
      ]
    }
  },

  // Configuración de almacenamiento persistente
  nitro: {
    storage: {
      db: {
        driver: 'fs',
        base: './data'
      }
    }
  },

  compatibilityDate: '2025-01-29',
})
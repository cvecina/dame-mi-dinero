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
    '@vite-pwa/nuxt',
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
  vite: {
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
    },
    server: {
      hmr: {
        overlay: false
      },
      watch: {
        ignored: ['**/.nuxt/**', '**/node_modules/**', '**/dist/**']
      }
    }
  },

  pwa: {
    registerType: 'prompt',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2,woff}'],
      cleanupOutdatedCaches: false,
      skipWaiting: false,
      clientsClaim: false,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.(?:png|gif|jpg|jpeg|svg|webp)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
            }
          }
        },
        {
          urlPattern: /^https:\/\/.*\.(?:js|css)$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-cache',
            expiration: {
              maxEntries: 60,
              maxAgeSeconds: 60 * 60 * 24 * 30
            }
          }
        }
      ]
    },
    client: {
      installPrompt: false,
      periodicSyncForUpdates: 0
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true
    },
    manifest: {
      name: 'Dame Mi Dinero - Control de Gastos',
      short_name: 'DameMiDinero',
      description: 'Aplicación para controlar gastos compartidos con amigos y gestionar presupuestos',
      theme_color: '#3A7CA5',
      background_color: '#F6F5F2',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/',
      lang: 'es',
      categories: ['finance', 'productivity', 'utilities', 'lifestyle'],
      screenshots: [
        {
          src: '/screenshots/dashboard.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide'
        },
        {
          src: '/screenshots/mobile.png', 
          sizes: '375x812',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ],
      shortcuts: [
        {
          name: 'Agregar Gasto',
          short_name: 'Nuevo Gasto',
          description: 'Agregar un nuevo gasto rápidamente',
          url: '/?action=add-expense',
          icons: [
            {
              src: '/icons/add-expense.svg',
              sizes: '96x96',
              type: 'image/svg+xml'
            }
          ]
        },
        {
          name: 'Ver Balances',
          short_name: 'Balances',
          description: 'Ver los balances actuales',
          url: '/balances',
          icons: [
            {
              src: '/icons/balance.svg',
              sizes: '96x96', 
              type: 'image/svg+xml'
            }
          ]
        },
        {
          name: 'Presupuestos',
          short_name: 'Presupuestos',
          description: 'Gestionar presupuestos',
          url: '/?action=budgets',
          icons: [
            {
              src: '/icons/budget.svg',
              sizes: '96x96',
              type: 'image/svg+xml'
            }
          ]
        }
      ],
      icons: [
        {
          src: '/icons/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/icons/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/icons/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png'
        },
        {
          src: '/icons/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/icons/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: '/icons/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icons/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: '/icons/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
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
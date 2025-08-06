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
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@vueuse/nuxt'
    //'@nuxt/image',
  ],

  i18n: {
    vueI18n: './i18n.config.ts' // if you are using custom path, default
  },

  css: [
    "@/assets/css/main.css"
  ],

  build: {
  },

  colorMode: {
    preference: 'light', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
  },

  compatibilityDate: '2025-01-29',
})
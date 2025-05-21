// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  dir: {
    layouts: './src/layouts',
    pages: './src/pages',
    middleware: './src/middlewares',
    plugins: './src/plugins'
  },
  modules: ['@nuxt/eslint'],
  css: ['~/src/assets/css/main.css'],
    postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    },
  },
})
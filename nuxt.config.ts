// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath, URL } from 'node:url'
// import eslintPlugin from 'vite-plugin-eslint'
import app from './app_config'

const GA_ID = import.meta.env.VITE_GA_ID as string

export default {
  ssr: true,
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', '@nuxtjs/tailwindcss', 'nuxt-gtag', '@nuxt/eslint', '@nuxt/fonts', '@nuxt/ui'],
  compatibilityDate: '2025-05-15',

  gtag: {
    id: GA_ID
  },
  dir: {
    layouts: './src/layouts',
    pages: './src/pages',
    middleware: './src/middlewares',
    plugins: './src/plugins'
  },
  components: [
    '@/components',
    '@/assets',
    { path: '@/components/core', extensions: ['vue'] }
  ],
  css: ['@/assets/css/main.css'],
  alias: {
    '@': './src'
  },
  security: {
    headers: {
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
      contentSecurityPolicy: {
        connectSrc: false
      }
    }
  },
  vite: {
    plugins: [
      // eslintPlugin({ useEslintrc: true, exclude: ['**/node_modules/**'] })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  },
  app,
  runtimeConfig: {
    public: {
      posthogPublicKey: import.meta.env.VITE_POSTHOG_PUBLIC_KEY as string,
      posthogHost: 'https://us.i.posthog.com',
      GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY
    }
  },
  nitro: {
    vercel: {
      functions: {
        maxDuration: 60
      }
    }
  }
  
}
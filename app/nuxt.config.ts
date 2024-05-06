// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Watch my plants 🌱',
    },
  },
  runtimeConfig: {
    dataPath: './data',
    apiToken: '12345678',
    s3: {
      endpoint: '',
      region: 'default',
      accessKey: '',
      secretKey: '',
      bucket: 'plant-watch',
    },
  },
  $production: {
    runtimeConfig: {
      dataPath: '/app/data',
      apiToken: '',
    },
  },
});

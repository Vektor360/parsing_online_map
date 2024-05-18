const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 3000,
    proxy: {
      '/places': {
        target: 'http://localhost:3000',
        //changeOrigin: true,
        pathRewrite: {
          '^/places': '' // Если API сервера принимает запросы без /places, то уберите эту строку
        }
      }
    }
  }
})

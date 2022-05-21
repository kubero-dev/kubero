//const configureAPI = require('../app/configure');

module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = "Locust Swarm Dashboard"
      return args;
    })
  },
  devServer: {
    //before: configureAPI.before,
    // Can't figure out how to connect up socket.io as part of webpack devServer
    //after: configureAPI.after
  },

  transpileDependencies: [
    'vuetify'
  ]
};

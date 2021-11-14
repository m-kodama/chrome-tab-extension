/* eslint-disable no-undef */
module.exports = {
  publicPath: './',
  configureWebpack: (config) => {
    config.devtool = 'inline-source-map';
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat');
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2,
            },
          },
        };
      });
  },
};

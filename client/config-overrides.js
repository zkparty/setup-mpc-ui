// through this file we can override the default cra configuration
// see: https://github.com/timarney/react-app-rewired
const path = require('path');


module.exports = {
  override: function(config, env) {
    const wasmExtensionRegExp = /\.wasm$/;

    config.resolve.extensions.push('.wasm');
    // make the file loader ignore wasm files
    let fileLoader = null;
    config.module.rules.forEach(rule => {
      (rule.oneOf || []).map(oneOf => {
        if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
          fileLoader = oneOf;
        }
      });
    });
    fileLoader.exclude.push(wasmExtensionRegExp);

    // Add a dedicated loader for them
    config.module.rules.push({
      test: wasmExtensionRegExp,
      include: path.resolve(__dirname, 'src'),
      use: [{ loader: require.resolve('wasm-loader'), options: {} }],
    });
    return config;
  },
  // Extend/override the dev server configuration used by CRA
  // See: https://github.com/timarney/react-app-rewired#extended-configuration-options
  devServer: function(configFunction) {
    return function(proxy, allowedHost) {
      // Create the default config by calling configFunction with the proxy/allowedHost parameters
      // Default config: https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpackDevServer.config.js
      const config = configFunction(proxy, allowedHost);

      // Set loose allow origin header to prevent CORS issues
      config.headers = {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      }

      return config;
    };
  },
};
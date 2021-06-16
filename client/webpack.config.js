module.exports = {
  module: {
    rules: [
      { 
        test: /\.m?js$/, 
        include: [path.resolve('node_modules/ffjavascript/')],
        exclude: /node_modules\/(?!ffjavascript).+/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime', 
              {
                  "absoluteRuntime": false,
                  "corejs": false,
                  "helpers": true,
                  "regenerator": true,
                  "version": "7.0.0-beta.0"
              }],
          }
        }
      },
    ],
    resolve: {
        fallback: {
          util: require.resolve("util/")
        }
    },
    optimization: {
      minimize: false
    },
  },
};
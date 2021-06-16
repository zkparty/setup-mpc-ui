module.exports = {
  module: {
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
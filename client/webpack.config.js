module.exports = {
    resolve: {
        fallback: {
          util: require.resolve("util/")
        }
    },
    optimization: {
      minimize: false
    },
  };
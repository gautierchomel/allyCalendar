

module.exports = {
  map: false,
  plugins: [
      require('postcss-import')(),
      require('postcss-nested')(),
      // require('cssnano')()
  ]
};

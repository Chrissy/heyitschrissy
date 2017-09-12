const path = require('path').normalize;

module.exports = {
  entry: ['whatwg-fetch', 'babel-polyfill', './static/app.js'],
  output: {
    path: path(__dirname + '/static/dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["es2015"],
            plugins: ["babel-plugin-transform-object-rest-spread", "babel-plugin-transform-runtime"]
          }
        }
      }
    ]
  }
};

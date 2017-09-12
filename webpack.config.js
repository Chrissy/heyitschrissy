const path = require('path').normalize;

module.exports = {
  entry: './static/app.js',
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
            presets: ["es2015"]
          }
        }
      }
    ]
  }
};

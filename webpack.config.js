const path = require('path')

module.exports = {
  entry: './docs/App.jsx',
  output: {
    filename: './docs/bundle.js'
  },
  devServer: {
    inline: true,
    contentBase: path.join(__dirname, 'docs'),
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  devtool: 'source-map'
}

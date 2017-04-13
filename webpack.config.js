module.exports = {
  entry: './docs/App.jsx',
  output: {
    filename: './docs/bundle.js'
  },
  devServer: { 
    inline: true 
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

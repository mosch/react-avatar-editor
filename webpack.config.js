const path = require('path')

module.exports = {
  entry: './docs/App.jsx',
  output: {
    path: path.resolve(
      __dirname,
      process.env.NODE_ENV === 'production' ? 'docs' : 'dist'
    ),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    inline: true,
    contentBase: path.join(__dirname, 'docs'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  devtool: 'source-map',
}

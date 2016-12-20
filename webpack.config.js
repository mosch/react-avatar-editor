module.exports = {
  entry: './demo/App.jsx',
  output: {
    filename: './demo/bundle.js'
  },
  devServer: { 
    inline: true 
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: [
            'react',
            'es2015'
          ],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread',
            'transform-function-bind'
          ]
        }
      }
    ]
  }
};

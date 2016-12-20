module.exports = {
  entry: './example/app.js',
  output: {
    filename: './example/bundle.js'
  },
  devServer: { 
    inline: true 
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
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

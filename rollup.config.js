import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'

const pkg = require('./package.json')
const external = Object.keys(pkg.dependencies)

export default {
  input: 'src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
  external: [...external, 'react', 'react-dom'],
  output: {
    file: pkg.main,
    format: 'umd',
    name: 'AvatarEditor',
    sourcemap: false,
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
    },
  },
}

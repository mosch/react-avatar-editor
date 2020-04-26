import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'

const pkg = require('./package.json')
const external = Object.keys(pkg.dependencies)

export default {
  entry: 'src/index.js',
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    uglify(),
  ],
  external: external,
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes',
    classnames: 'classNames',
  },
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'AvatarEditor',
      sourceMap: false,
    },
  ],
}

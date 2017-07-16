import babelrc from 'babelrc-rollup'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import _isEqual from 'lodash/isEqual'

const pkg = require('./package.json')
const external = Object.keys(pkg.dependencies)

const config = babelrc({ addExternalHelpersPlugin: false })

const whiteList = ['es2015']

config.presets = config.presets.map(([name, config]) => {
  if (!whiteList.includes(name) && _isEqual(config, { modules: false })) {
    return name
  } else {
    return [name, config]
  }
})

let plugins = [
  babel(config),
  uglify()
]

export default {
  entry: 'src/index.js',
  plugins,
  external: external,
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'prop-types': 'PropTypes'
  },
  targets: [
    {
      dest: pkg.main,
      format: 'umd',
      moduleName: 'AvatarEditor',
      sourceMap: true
    }
  ]
}

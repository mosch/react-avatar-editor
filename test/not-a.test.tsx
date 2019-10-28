import * as React from 'react'
import 'canvas'
import * as ReactDOM from 'react-dom'
import ReactAvatarEditor from '../src'

describe('it', () => {
  it('renders with crashing', () => {
    const div = document.createElement('div')
    expect(() => {
      ReactDOM.render(<ReactAvatarEditor />, div)
    }).toThrow()
    ReactDOM.unmountComponentAtNode(div)
  })
})

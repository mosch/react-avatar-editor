/* eslint-env jest */

import parseDOM from './parse-dom'

describe('parseDOM', () => {
  let realDOMParser,
    result

  beforeEach(() => {
    realDOMParser = global.DOMParser
  })

  afterEach(() => {
    global.DOMParser = realDOMParser
  })

  describe('DOMParser available', () => {
    let parseFromString

    beforeEach(() => {
      parseFromString = jest.fn().mockReturnValue('%document%')
      global.DOMParser = jest.fn(() => ({ parseFromString }))

      result = parseDOM('<div id="test"></div>')
    })

    it('creates a new DOMParser', () => {
      expect(global.DOMParser).toHaveBeenCalled()
    })

    it('calls parseFromString with the passed-in string', () => {
      expect(parseFromString).toHaveBeenCalledWith(
        '<div id="test"></div>',
        'text/html'
      )
    })

    it('returns the value returned by parseFromString', () => {
      expect(result).toBe('%document%')
    })
  })

  describe('No DOMParser available', () => {
    beforeEach(() => {
      global.DOMParser = undefined

      result = parseDOM('<div id="test"></div>')
    })

    it('retuns null', () => {
      expect(result).toBeNull()
    })
  })
})

/* eslint-env jest */

describe('retrieveImageURL', () => {
  let retrieveImageURL, mockParseDOM, mockQuerySelector

  beforeEach(() => {
    mockQuerySelector = jest.fn()
    mockParseDOM = jest.fn()

    jest.mock('./parse-dom', () => mockParseDOM)

    retrieveImageURL = require('./retrieve-image-url').default
    mockParseDOM = require('./parse-dom')
  })

  it('runs getAsString on the first item with type "text/html"', () => {
    const items = [
      { getAsString: jest.fn(), type: 'something/else' },
      { getAsString: jest.fn(), type: 'text/html' },
    ]

    retrieveImageURL(items, () => {})

    expect(items[0].getAsString).not.toHaveBeenCalled()
    expect(items[1].getAsString).toHaveBeenCalled()
  })

  it('does not run getAsString on later items with type "text/html"', () => {
    const items = [
      { getAsString: jest.fn(), type: 'text/html' },
      { getAsString: jest.fn(), type: 'text/html' },
    ]

    retrieveImageURL(items, () => {})

    expect(items[0].getAsString).toHaveBeenCalled()
    expect(items[1].getAsString).not.toHaveBeenCalled()
  })

  describe('with html returned in getAsString callback', () => {
    let callback, invokeGetAsStringCallback

    beforeEach(() => {
      const items = [{ getAsString: jest.fn(), type: 'text/html' }]

      callback = jest.fn()

      mockParseDOM.mockReturnValue({
        querySelector: mockQuerySelector,
      })

      retrieveImageURL(items, callback)

      invokeGetAsStringCallback = () =>
        items[0].getAsString.mock.calls[0][0]('<div id="test-fragment"></div>')
    })

    it('creates a document using parseDOM', () => {
      invokeGetAsStringCallback()
      expect(mockParseDOM).toHaveBeenCalledWith(
        '<div id="test-fragment"></div>'
      )
    })

    it('searches for img elements', () => {
      invokeGetAsStringCallback()
      expect(mockQuerySelector).toHaveBeenCalledWith('img')
    })

    describe('if the document contains an img with a src attribute', () => {
      beforeEach(() => {
        mockQuerySelector.mockReturnValue({
          src: 'http://placekitten.com/100/100',
        })
        invokeGetAsStringCallback()
      })

      it('should invoke the callback passed to retrieveImageURL with the value of the src attribute', () => {
        expect(callback).toHaveBeenCalledWith('http://placekitten.com/100/100')
      })
    })

    describe('if the document contains an img without a src attribute', () => {
      beforeEach(() => {
        mockQuerySelector.mockReturnValue({})
        invokeGetAsStringCallback()
      })

      it('should invoke the callback passed to retrieveImageURL with the value of the src attribute', () => {
        expect(callback).not.toHaveBeenCalled()
      })
    })

    describe('if the documetn does not contain an img', () => {
      beforeEach(() => {
        mockQuerySelector.mockReturnValue(null)
        invokeGetAsStringCallback()
      })

      it('should invoke the callback passed to retrieveImageURL with the value of the src attribute', () => {
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })
})

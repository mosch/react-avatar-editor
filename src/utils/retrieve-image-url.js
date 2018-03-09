import parseDOM from './parse-dom'

/*
 * Retrieves image URL from collection of data transfer
 * items, if one is present.  As the item will contain
 * an HTML string containing an img element, it's
 * necessary to parse the HTML and then pull the src
 * attribute off the image.
 */
const retrieveImageURL = (dataTransferItems, callback) => {
  for (let i = 0; i < dataTransferItems.length; i++) {
    const item = dataTransferItems[i]

    if (item.type === 'text/html') {
      item.getAsString(value => {
        const doc = parseDOM(value)
        const img = doc.querySelector('img')
        if (img && img.src) {
          callback(img.src)
        }
      })
      break
    }
  }
}

export default retrieveImageURL

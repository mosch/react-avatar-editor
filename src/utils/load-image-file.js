/* eslint-env browser, node */
import loadImageURL from './load-image-url'

export default function loadImageFile(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const image = loadImageURL(e.target.result)
        resolve(image)
      } catch (e) {
        reject(e)
      }
    }
    reader.readAsDataURL(imageFile)
  })
}

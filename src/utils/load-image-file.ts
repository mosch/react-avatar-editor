/* eslint-env browser, node */
import loadImageURL from './load-image-url'

export default function loadImageFile(
  imageFile: File
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        if (!e.target) {
          reject('No target')
        } else {
          const image = loadImageURL(e.target.result as string)
          resolve(image)
        }
      } catch (e) {
        reject(e)
      }
    }
    reader.readAsDataURL(imageFile)
  })
}

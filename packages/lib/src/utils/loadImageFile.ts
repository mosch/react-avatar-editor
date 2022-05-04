import { loadImageURL } from './loadImageURL'

export const loadImageFile = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (!e?.target?.result) {
          throw new Error('No image data')
        }
        const image = loadImageURL(e.target.result as string)
        resolve(image)
      } catch (e) {
        reject(e)
      }
    }
    reader.readAsDataURL(file)
  })

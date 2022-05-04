import loadImageURL from './load-image-url'

export default function loadImageFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
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
}

/* eslint-env browser, node */

function isDataURL(str: string) {
  if (str === null) {
    return false
  }
  const regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i
  return !!str.match(regex)
}

export default function loadImageURL(imageURL: string, crossOrigin?: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    if (!isDataURL(imageURL) && crossOrigin) {
      image.crossOrigin = crossOrigin
    }
    image.src = imageURL
  })
}

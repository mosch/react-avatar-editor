// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
export const isPassiveSupported = () => {
  let passiveSupported = false
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function () {
        passiveSupported = true
      },
    })

    const handler = () => {}
    window.addEventListener('test', handler, options)
    window.removeEventListener('test', handler, options)
  } catch (err) {
    passiveSupported = false
  }
  return passiveSupported
}

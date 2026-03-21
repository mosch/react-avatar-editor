// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
const noop = () => {}

export const isPassiveSupported = () => {
  let passiveSupported = false
  try {
    const options = Object.defineProperty({}, 'passive', {
      get: function () {
        passiveSupported = true
      },
    })

    window.addEventListener('test', noop, options)
    window.removeEventListener('test', noop, options)
  } catch {
    passiveSupported = false
  }
  return passiveSupported
}

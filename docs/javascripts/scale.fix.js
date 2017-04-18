// eslint-disable-next-line
fixScale = function(doc) {
  var addEvent = 'addEventListener'
  var type = 'gesturestart'
  var qsa = 'querySelectorAll'
  var scales = [1, 1]
  var meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : []

  function fix () {
    meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1]
    doc.removeEventListener(type, fix, true)
  }

  if ((meta = meta[meta.length - 1]) && addEvent in doc) {
    fix()
    scales = [0.25, 1.6]
    doc[addEvent](type, fix, true)
  }
}

function enableGesture(ele) {
  let contexts = Object.create(null)

  let Mouse_Symbol = Symbol("mouse")

  if (document.ontouchstart !== null) {
    ele.addEventListener("mousedown", e => {
      contexts[Mouse_Symbol] = Object.create(null);
      start(e, contexts[Mouse_Symbol])
      let mousemove = e => {
        console.log(e.clientX, e.clientY);
        move(e, contexts[Mouse_Symbol])
      }
      let mouseend = e => {
        end(e, contexts[Mouse_Symbol])
        document.removeEventListener('mousemove', mousemove)
        document.removeEventListener('mouseup', mouseend)
      }
      document.addEventListener('mousemove', mousemove)
      document.addEventListener('mouseup', mouseend)
    })
  }

  // tap
  // pan(panstart/panmove/panend)
  // flick
  // press(pressstart/pressend)

  ele.addEventListener('touchstart', e => {
    for (const touch of e.changedTouches) {
      contexts[touch.identifier] = Object.create(null)
      start(touch, contexts[touch.identifier])
    }
  })

  ele.addEventListener('touchmove', e => {
    for (const touch of e.changedTouches) {
      move(touch, contexts[touch.identifier])
    }
  })

  ele.addEventListener('touchend', e => {
    for (const touch of e.changedTouches) {
      end(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })

  ele.addEventListener('touchcancel', e => {
    for (const touch of e.changedTouches) {
      cancel(touch, contexts[touch.identifier])
      delete contexts[touch.identifier]
    }
  })

  function dispatch(name, data = {}) {
    ele.dispatchEvent(Object.assign(new CustomEvent(name), data))
  }
  ele.dispatch = dispatch

  let start = (point, context) => {
    ele.dispatch('start', {
      startX: point.startX,
      startY: point.startY,
      clientX: point.clientX,
      clientY: point.clientY,
    })
    context.startX = point.clientX
    context.startY = point.clientY
    context.moves = []
    context.isTap = true
    context.isPan = false
    context.isPress = false

    context.timeoutHandler = setTimeout(() => {
      if (context.isPan) return
      context.isTap = false
      context.isPan = false
      context.isPress = true
      ele.dispatch('pressStart')
    }, 500);
  }

  let move = (point, context) => {

    let dx = point.clientX - context.startX
    let dy = point.clientY - context.startY

    if (dx ** 2 + dy ** 2 > 100 && !context.isPan) {
      if (context.isPress) {
        ele.dispatch('pressCancel')
      }
      context.isTap = false
      context.isPan = true
      context.isPress = false
      ele.dispatch('panStart', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
      })
    }

    if (context.isPan) {
      context.moves.push({
        dx,
        dy,
        t: Date.now()
      })
      context.moves.filter(r => Date.now() - r.t < 300)
      ele.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
      })
    }

  }

  let end = (point, context) => {
    clearTimeout(context.timeoutHandler)

    if (context.isTap) {
      ele.dispatch('tap')
    }

    if (context.isPan) {
      let dx = point.clientX - context.startX
      let dy = point.clientY - context.startY
      let r = context.moves[0]
      let speed = Math.sqrt((r.dx - dx) ** 2 + (r.dy - dy) ** 2) / (Date.now() - r.t)
      let isFlick = speed > 2.5
      if (isFlick) {
        ele.dispatch('flick', {
          startX: context.startX,
          startY: context.startY,
          clientX: point.clientX,
          clientY: point.clientY,
          speed,
        })
      }
      ele.dispatch('panEnd', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        speed,
        isFlick
      })
    }

    if (context.isPress) {
      ele.dispatch('pressEnd')
    }

  }

  let cancel = (point, context) => {
    ele.dispatch('canceled')
    clearTimeout(context.timeoutHandler)
  }
}
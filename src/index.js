const EVENTS = {
  ready: 'ENGINE_READY',
  beforeLoad: 'BEFORE_LOAD',
}

export const ERRORS = {
  MISSING_INITIALIZER:
    'need an `init` function in the options to create an Engine ',
  MISSING_MODULES:
    'need an `modules` function in the options to create an Engine ',
}

export function Engine(appOptions) {
  this.ready = false
  this.listeners = {}

  if (!(appOptions?.init && typeof appOptions?.init === 'function')) {
    throw new Error(ERRORS.MISSING_INITIALIZER)
  }

  if (!(appOptions?.modules && typeof appOptions?.modules === 'function')) {
    throw new Error(ERRORS.MISSING_MODULES)
  }

  const app = appOptions.init()
  const modules = appOptions.modules

  app.engine = this
  this.app = app

  Object.assign(app, appOptions.options || {})

  this.beforeLoad = listener => {
    this.listeners[EVENTS.beforeLoad] = this.listeners[EVENTS.beforeLoad] || []
    const id = this.listeners.length
    this.listeners[EVENTS.beforeLoad].push({
      id,
      listener,
    })

    return () => {
      const onIndex = this.listeners[EVENTS.beforeLoad].findIndex(
        x => x.id === id
      )
      this.listeners[EVENTS.beforeLoad].splice(onIndex, 1)
    }
  }

  this.loadModules = function loadModules() {
    fireForEvent.apply(this, [EVENTS.beforeLoad])

    const sequentialLoad = modules(app).reduce((acc, mod) => {
      return acc.then(async () => {
        const moduleLoaded = mod(this.app)
        if (moduleLoaded instanceof Promise) return await moduleLoaded

        return moduleLoaded
      })
    }, Promise.resolve())

    sequentialLoad.then(() => {
      // Notify all active listeners waiting for this
      this.ready = true
      fireForEvent.apply(this, [EVENTS.ready])
    })

    return this
  }

  this.onReady = listener => {
    this.listeners[EVENTS.ready] = this.listeners[EVENTS.ready] || []
    const id = this.listeners.length
    this.listeners[EVENTS.ready].push({
      id,
      listener,
    })

    return () => {
      const onIndex = this.listeners[EVENTS.ready].findIndex(x => x.id === id)
      this.listeners[EVENTS.ready].splice(onIndex, 1)
    }
  }
}

function fireForEvent(eventName, message) {
  if (!this.listeners[eventName]) return
  ;(this.listeners[eventName] || []).forEach(listenerObj => {
    listenerObj.listener(message)
  })
}

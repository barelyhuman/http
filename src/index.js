/**
 * @typedef {(app: any) => any} ModuleLoader
 */

/**
 * @typedef {object} Options
 * @property {() => any} init
 * @property {ModuleLoader []} modules
 * @property {Record<string,any>} options
 */

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

export class Engine {
  ready = false
  app = {}
  listeners = []
  modules = app => []

  /**@type {Options}*/
  options = {}

  /**
   * @param {Options} appOptions
   */
  constructor(appOptions) {
    if (!(appOptions?.init && typeof appOptions?.init === 'function')) {
      throw new Error(ERRORS.MISSING_INITIALIZER)
    }
    if (!(appOptions?.modules && typeof appOptions?.modules === 'function')) {
      throw new Error(ERRORS.MISSING_MODULES)
    }

    this.options = appOptions
    this.init = this.init.bind(this)
    this.loadModules = this.loadModules.bind(this)
    this.beforeLoad = this.beforeLoad.bind(this)
    this.onReady = this.onReady.bind(this)

    this.init()
  }

  init() {
    const app = this.options.init()
    this.modules = this.options.modules
    app.engine = this
    this.app = app
    Object.assign(app, this.options.options || {})
  }

  beforeLoad(listener) {
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

  onReady(listener) {
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

  loadModules() {
    fireForEvent.apply(this, [EVENTS.beforeLoad, this.app])

    const sequentialLoad = this.modules(this.app).reduce((acc, mod) => {
      return acc.then(async () => {
        const moduleLoaded = mod(this.app)
        if (moduleLoaded instanceof Promise) return await moduleLoaded

        return moduleLoaded
      })
    }, Promise.resolve())

    sequentialLoad.then(() => {
      // Notify all active listeners waiting for this
      this.ready = true
      fireForEvent.apply(this, [EVENTS.ready, this.app])
    })

    return this
  }
}

function fireForEvent(eventName, message) {
  if (!this.listeners[eventName]) return
  ;(this.listeners[eventName] || []).forEach(listenerObj => {
    listenerObj.listener(message)
  })
}

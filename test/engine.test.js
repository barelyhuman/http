import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Engine, ERRORS } from '../src/index.js'

test('Throw without an init func', () => {
  assert.throws(() => new Engine(), ERRORS.MISSING_INITIALIZER)
})

test('Throw without an module func', () => {
  assert.throws(
    () =>
      new Engine({
        init() {
          return {}
        },
      }),
    ERRORS.MISSING_MODULES
  )
})

test('Create an Engine instance', () => {
  assert.instance(
    new Engine({
      init() {
        return {}
      },
      modules() {
        return []
      },
    }),
    Engine
  )
})

test('Load a module', () => {
  const app = {}
  const engine = new Engine({
    init() {
      return app
    },
    modules() {
      return [
        function (app) {
          app.foo = 'bar'
        },
      ]
    },
  })

  engine.loadModules().onReady(() => {
    assert.equal(app.foo, 'bar')
  })
})

test('Load a module sequentially', () => {
  const app = {}
  const engine = new Engine({
    init() {
      return app
    },
    modules() {
      return [
        function (app) {
          app.foo = 'bar'
        },
        function (app) {
          app.foo = 'bar2'
        },
      ]
    },
  })

  engine.loadModules().onReady(() => {
    assert.equal(app.foo, 'bar2')
  })
})

test.run()

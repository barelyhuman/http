export class Router {
  routes = {}

  constructor() {
    this.add = this.add.bind(this)
    this.find = this.find.bind(this)
  }

  add(method, path, handler) {
    if (!this.routes[method]) {
      this.routes[method] = {}
    }

    const props = isDynamicRoute(path)
    this.routes[method][path] = { ...props, handler: handler }
  }
  find(method, path) {
    if (this.routes[method][path]) {
      return {
        routeHandler: this.routes[method][path],
        params: {},
      }
    }

    const matchingRoute = Object.keys(this.routes[method]).find(route =>
      this.routes[method][route].parse.test(path)
    )

    if (matchingRoute) {
      return {
        routeHandler: this.routes[method][matchingRoute],
        params: this.routes[method][matchingRoute].getParam(path),
      }
    }

    return {
      routeHandler: {
        handler: (req, res) => {
          res.status = 404
          res.end()
        },
      },
      params: {},
    }
  }
}

function isDynamicRoute(route) {
  let routeString = route
  const dynRegex = /(\[\w+\])/g
  const matchGroups = route.match(dynRegex) || []
  matchGroups.forEach(groupItem => {
    routeString = routeString.replace(groupItem, '((\\w+[-]*)+)')
  })
  routeString = routeString.replace(/\//g, '\\/')
  const parser = RegExp(`^${routeString}$`)
  return {
    dynamic: dynRegex.test(route),
    parse: parser,
    getParam: url => {
      const group = url.match(parser).slice(1)

      const params = {}

      matchGroups.forEach((item, index) => {
        const key = item.replace(/[\[\]]/g, '')
        params[key] = group[index]
      })

      return params
    },
  }
}

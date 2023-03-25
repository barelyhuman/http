export class Middleware {
  middlewareFns = {}

  constructor() {
    this.add = this.add.bind(this)
    this.handler = this.handler.bind(this)
  }

  static create() {
    return new Middleware()
  }

  /**
   * @param {Function[]} fn
   * */
  add(...fn) {
    fn.forEach(f => this.middlewareFns(f))
  }

  handler(req, res) {
    const createNext = _pointer => {
      return () => {
        let exec = this.middlewareFns[_pointer]
        if (!this.middlewareFns[_pointer]) {
          exec = () => {}
        }
        return exec(req, res, createNext(_pointer + 1))
      }
    }
    return this.middlewareFns[0](req, res, createNext(0))
  }
}

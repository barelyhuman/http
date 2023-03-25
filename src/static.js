import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

export class Static {
  rootPath = ''
  prefix = ''

  /**
   * @param {string} prefix - prefix to check for in the request
   * @param {string} rootPath
   */
  constructor(prefix, rootPath) {
    this.prefix = prefix
    this.rootPath = rootPath
    this.serve = this.serve.bind(this)
    this.hasFile = this.hasFile.bind(this)
    this._getFilePathFromURL = this._getFilePathFromURL.bind(this)
  }

  hasFile(req) {
    const fpath = this._getFilePathFromURL(req)
    if (!existsSync(fpath)) {
      return false
    }
    return true
  }

  /**
   * @param {string} prefix
   * @param {string} rootPath
   */
  static create(prefix, rootPath) {
    return new Static(prefix, rootPath)
  }

  _getFilePathFromURL(req) {
    let fpath = (req.url || '').replace(this.prefix, '')
    if (fpath.trim().length == 0) {
      fpath = 'index.html'
    }
    return join(this.rootPath, fpath)
  }

  serve(req, res) {
    // don't have to handle for requests that aren't GET / HEAD
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405
      res.end()
      return
    }

    if (!req.url.startsWith(this.prefix)) {
      return res.end()
    }

    if (req.method == 'HEAD') {
      // If HEAD, then just end the response without changing status
      return res.end()
    }

    const fpath = this._getFilePathFromURL(req)

    if (!this.hasFile(req)) {
      res.status = 404
      res.end()
      return
    }

    const fstream = createReadStream(fpath)
    fstream.on('end', () => {
      res.end()
    })
    fstream.pipe(res)
  }
}

import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

export class Static {
  rootPath

  constructor(rootPath) {
    this.rootPath = rootPath
    this.serve = this.serve.bind(this)
  }

  serve(req, res) {
    // don't have to handle for requests that aren't GET / HEAD
    if (req.method !== GET || req.method !== HEAD) {
      res.status = 405
      res.end()
      return
    }

    // If HEAD, then just end the response without changing status
    if (req.method == HEAD) {
      return res.end()
    }

    const reqPath = req.url
    const fpath = join(this.rootPath, reqPath)

    if (!existsSync(fpath)) {
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

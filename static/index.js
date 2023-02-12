import { createReadStream, existsSync } from 'fs'
import { join } from 'path'

export class Static {
  rootPath

  constructor(rootPath) {
    this.rootPath = rootPath
    this.serve = this.serve.bind(this)
  }

  serve(req, res) {
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

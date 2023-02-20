import * as esbuild from 'esbuild'
import Watcher from 'watcher'
import glob from 'tiny-glob'
import path from 'path'

const watch = process.argv.slice(2).includes('-w')

const common = {
  logLevel: 'info',
}

async function main() {
  const configs = [].concat(
    createEntry('src/index.js'),
    createEntry('src/router.js'),
    createEntry('src/static.js')
  )
  await Promise.all(configs.map(x => esbuild.build(x)))
}

function createEntry(entry) {
  const formats = [
    {
      format: 'esm',
      outfile(filename) {
        let outFile = filename
        if (filename.endsWith('.ts') || filename.endsWith('.js')) {
          if (/\.ts$/.test(filename)) {
            outFile = filename.replace(/\.ts$/, '.js')
          } else if (/\.js$/.test(filename)) {
            outFile = filename.replace(/\.js$/, '.js')
          }
        }
        return path.join('./dist', outFile)
      },
    },
    {
      format: 'cjs',
      outfile(filename) {
        let outFile = filename
        if (filename.endsWith('.ts') || filename.endsWith('.js')) {
          if (/\.ts$/.test(filename)) {
            outFile = filename.replace(/\.ts$/, '.cjs')
          } else if (/\.js$/.test(filename)) {
            outFile = filename.replace(/\.js$/, '.cjs')
          }
        }
        return path.join('./dist', outFile)
      },
    },
  ]

  let filename = path.basename(entry)
  return formats.map(x => {
    return {
      ...common,
      entryPoints: [].concat(entry),
      format: x.format,
      outfile: x.outfile(filename),
    }
  })
}

// if watching, watcher will execute an
// initial build
!watch && (await main())

if (watch) {
  const gPaths = await glob('./src/**/*.{ts,js}', { absolute: true })
  const watcher = new Watcher(gPaths)
  watcher.on('error', error => {
    console.error(error)
  })

  watcher.on('close', () => {
    process.exit(0)
  })

  watcher.on('all', async () => {
    await main()
  })
}

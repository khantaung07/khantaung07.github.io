import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extname, resolve, sep } from 'node:path'
import { handleCs2Request } from './leetify.mjs'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.mp4': 'video/mp4',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf',
}

createServer(async (request, response) => {
  try {
    if (await handleCs2Request(request, response)) return
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    const path = resolve(dist, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (!path.startsWith(dist.endsWith(sep) ? dist : `${dist}${sep}`)) {
      response.writeHead(403).end()
      return
    }
    const file = await stat(path)
    if (!file.isFile()) throw new Error('Not a file')
    const headers = {
      'Content-Type': contentTypes[extname(path)] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
    }
    let start = 0, end = file.size - 1
    const range = request.method === 'GET' ? request.headers.range : undefined
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range)
      if (match && (match[1] || match[2])) {
        start = match[1] ? Number(match[1]) : Math.max(0, file.size - Number(match[2]))
        end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end
      }
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start)
        || !Number.isSafeInteger(end) || start >= file.size || end < start) {
        response.writeHead(416, { 'Content-Range': `bytes */${file.size}` }).end()
        return
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${file.size}`
    }
    response.writeHead(range ? 206 : 200, { ...headers, 'Content-Length': Math.max(0, end - start + 1) })
    if (request.method === 'HEAD' || !file.size) response.end()
    else {
      const stream = createReadStream(path, { start, end })
      response.on('close', () => stream.destroy())
      stream.on('error', () => response.destroy()).pipe(response)
    }
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => {
  console.log(`Portfolio: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 4173}`)
})

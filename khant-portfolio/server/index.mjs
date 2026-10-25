import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { extname, resolve, sep } from 'node:path'
import { handleCs2Request } from './leetify.mjs'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const contentTypes = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
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
    const file = await readFile(path)
    response.writeHead(200, { 'Content-Type': contentTypes[extname(path)] || 'application/octet-stream' })
    response.end(request.method === 'HEAD' ? undefined : file)
  } catch {
    response.writeHead(404).end('Not found')
  }
}).listen(Number(process.env.PORT || 4173), process.env.HOST || '127.0.0.1', () => {
  console.log(`Portfolio: http://${process.env.HOST || '127.0.0.1'}:${process.env.PORT || 4173}`)
})

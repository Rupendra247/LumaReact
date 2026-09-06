import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT) || 3000
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), 'dist')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
}

createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const filePath = normalize(join(ROOT, pathname.endsWith('/') ? pathname + 'index.html' : pathname))
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403, { 'content-type': 'text/plain' }).end('Forbidden')
      return
    }
    const file = await readFile(filePath).catch(() => null)
    if (file === null) {
      const index = await readFile(join(ROOT, 'index.html'))
      res.writeHead(200, { 'content-type': MIME['.html'] })
      res.end(index)
      return
    }
    res.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' })
    res.end(file)
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain' }).end('Internal Server Error')
  }
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Luma serving ${ROOT} on 0.0.0.0:${PORT}`)
})
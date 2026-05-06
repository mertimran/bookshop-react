import cds from '@sap/cds'
import path from 'node:path'
import { bus } from './srv/event-bus'

const isDev = process.env.NODE_ENV !== 'production'

const SPA_APPS = [
  { mount: '/shop', root: 'app/shop' },
  { mount: '/admin', root: 'app/admin' },
] as const

cds.on('bootstrap', (app: any) => {
  // Server-Sent Events for the live admin dashboard. Open in dev — production
  // should sit behind the approuter and be gated on the admin role.
  app.get('/api/admin/events', (req: any, res: any) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.write('retry: 3000\n\n')
    res.write(`: connected ${new Date().toISOString()}\n\n`)

    const onEvent = (msg: any) => {
      res.write(`event: ${msg.type}\n`)
      res.write(`data: ${JSON.stringify(msg)}\n\n`)
    }
    bus.on('event', onEvent)

    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n') } catch { /* noop */ }
    }, 25_000)

    req.on('close', () => {
      bus.off('event', onEvent)
      clearInterval(heartbeat)
    })
  })

  if (!isDev) return

  // Vite creation is async, but `cds.emit('bootstrap')` doesn't await listeners
  // and CAP registers its static `app/` middleware immediately after. We must
  // attach our `app.use` calls synchronously so they sit before CAP's static
  // in the Express stack; the per-request handler awaits the Vite servers.
  const vitesPromise = (async () => {
    const { createServer } = await import('vite')
    return Promise.all(
      SPA_APPS.map(({ mount, root }, i) =>
        createServer({
          root: path.resolve(process.cwd(), root),
          base: `${mount}/`,
          appType: 'spa',
          server: {
            middlewareMode: true,
            hmr: { port: 24678 + i },
          },
        }),
      ),
    )
  })()

  SPA_APPS.forEach(({ mount }, i) => {
    app.use(async (req: any, res: any, next: any) => {
      if (req.url === mount || req.url.startsWith(`${mount}/`) || req.url.startsWith(`${mount}?`)) {
        const vites = await vitesPromise
        return vites[i].middlewares(req, res, next)
      }
      next()
    })
  })

  cds.on('shutdown', async () => {
    const vites = await vitesPromise
    await Promise.all(vites.map(v => v.close()))
  })
})

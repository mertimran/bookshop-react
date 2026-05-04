import cds from '@sap/cds'
import path from 'node:path'

const isDev = process.env.NODE_ENV !== 'production'

const SPA_APPS = [
  { mount: '/shop', root: 'app/shop' },
  { mount: '/admin', root: 'app/admin' },
] as const

cds.on('bootstrap', (app: any) => {
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

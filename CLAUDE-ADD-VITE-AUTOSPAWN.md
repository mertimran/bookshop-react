# Recipe: Auto-spawn Vite from `cds watch` (single-terminal dev)

For a CAP project that hosts one or more React/Vite SPAs under `app/`, this
recipe wires Vite's dev server into CAP's Express app so a single
`cds watch` (or `cds watch --profile hybrid`) serves both the OData services
and the SPAs with HMR. No `concurrently`, no second terminal.

## When to apply

- Project has a CAP backend (`@sap/cds`) and one or more Vite-built SPAs in
  workspace folders under `app/` (e.g. `app/shop`, `app/admin`).
- Each SPA is currently started with its own `vite` / `npm run dev` and the
  user is running two-or-more terminals.
- The user wants the UI5-style "one server" feel without going to a built
  bundle.

Skip if the SPAs are pure UI5 / Fiori Elements (CAP already serves those
statically), or if production is the only target — this recipe is dev-only.

## What the user should already have

- `vite` available (either as a root devDep or transitively via the SPA
  workspaces — both work because `await import('vite')` resolves either way).
- A `server.ts` (or `server.js`) at the project root. CAP picks it up
  automatically; if it doesn't exist, create it.
- Each SPA's router uses `import.meta.env.BASE_URL` for its basepath (or is
  configured to be base-aware some other way). If routes are hard-coded to
  `/`, the SPA will break under a sub-path and you'll need to fix the router
  separately.

## The recipe

### 1. Pick a mount path per SPA

Choose a URL prefix for each SPA, e.g. `/shop`, `/admin`. Avoid `/` (collides
with CAP's welcome page) and any path CAP already serves (`/odata`, `/api`,
`/health`, `/$metadata`, etc.).

### 2. Drop this into `server.ts`

```ts
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
```

Adjust `SPA_APPS` for the project. That's the whole change.

### 3. Smoke test

```bash
npx cds watch
```

Then check:

- `curl -sI http://localhost:4004/shop/ | grep content-type` → `text/html`
- `curl -s http://localhost:4004/shop/ | grep '@vite/client'` → must contain
  `<script type="module" src="/shop/@vite/client">`. If it doesn't, the
  request is being served raw by CAP's static, not Vite — see Pitfall 3.
- `curl -sI http://localhost:4004/shop/src/main.tsx | grep content-type` →
  `text/javascript` (Vite transforming TS → JS). If it shows
  `application/octet-stream`, again Pitfall 3.
- `curl -o /dev/null -w '%{http_code}\n' http://localhost:4004/api/<service>/`
  → `200`. CAP services still work.
- Visit `/shop/` in a browser, edit a `.tsx`, see HMR reload.

## Three pitfalls (don't re-discover these)

These are the bugs the working code dodges. If a future change reverts any of
them, the symptoms below come back.

### Pitfall 1 — HMR port collision

Each Vite dev server opens an HMR WebSocket on port 24678 by default. Two
Vite instances → second one fails with `Port 24678 is already in use`.

Fix: `hmr: { port: 24678 + i }` per instance.

### Pitfall 2 — Express prefix-stripping breaks Vite's base check

The intuitive form `app.use('/shop', vite.middlewares)` does **not** work.
Express strips `/shop` from `req.url` before passing to the middleware, so
Vite's `baseMiddleware` (configured with `base: '/shop/'`) sees `/`, decides
this request isn't for it, and calls `next()`. CAP's static then serves the
file raw.

Fix: mount the middleware at the root and route by URL prefix manually.
That's what the `app.use(async (req,...) => { if (req.url.startsWith(mount + '/')) ...})`
guard in the recipe does — Vite sees the full URL, so its base check matches.

Symptom if reverted: SPA assets 404 or load with no transforms.

### Pitfall 3 — `cds.emit('bootstrap')` doesn't await async listeners

This is the gotcha that ate the most time. From `@sap/cds/server.js`:

```js
cds.emit('bootstrap', app)              // listeners fire, but emit returns immediately
if (o.static) app.use(express.static(o.static))   // CAP's static for app/ — runs RIGHT NOW
```

If your bootstrap handler is `async (app) => { const v = await createServer(...); app.use(v.middlewares) }`,
the `app.use` call happens **after** CAP's static is already in the Express
stack. Express matches FIFO, so CAP's static wins for any URL that resolves
to a real file (e.g. `/shop/index.html`, `/shop/`). Deep client-side routes
(`/shop/books/123`) work because CAP's static can't find them and falls
through to your Vite middleware — making the bug feel intermittent and
confusing.

Fix: register `app.use(...)` **synchronously** inside the bootstrap callback,
have the per-request handler `await` the (eagerly-started) Vite-creation
promise. The recipe above does this.

Symptom if reverted: `/shop/` and `/shop/index.html` return raw HTML
(no `@vite/client` script, content-type `text/html` but with `Last-Modified`
matching the file mtime), while deep routes like `/shop/books/123` work fine.

## What this recipe does NOT do

- It does not change `vite.config.ts` files. `base` is set per-instance via
  `createServer({ base })` so production builds (where each SPA is served
  from its own root by the HTML5 app repo) are unaffected.
- It does not serve built `dist/` bundles. Production code path is gated out
  by `if (!isDev) return`. If the user wants a "preview built bundles
  locally" mode, add `express.static(path.resolve(root, 'dist'))` in an
  `else` branch — but only if asked.
- It does not handle a SPA mounted at `/`. That collides with CAP's welcome
  page; if the user really wants this, they'd need to also disable
  `cds.env.server.index` and choose how `/api`, `/odata` etc. coexist with
  client-side routes.

## Things to verify per project

- **`vite` is resolvable from the project root.** `await import('vite')` will
  fail otherwise. If only the SPA workspaces have `vite`, hoisting usually
  makes it resolvable from the root anyway, but verify with
  `node -e "console.log(require.resolve('vite'))"`.
- **Router basepath.** Open each SPA's `main.tsx` (or wherever the router is
  created) and confirm the basepath comes from `import.meta.env.BASE_URL`
  (or some equivalent). If routes are hard-coded to `/`, links and
  navigation will break under `/shop/`.
- **No path conflicts.** Grep CAP service definitions and `cds.requires` for
  any service mounted under the chosen mount paths.
- **HMR over a tunnel/remote.** The recipe uses Vite's default HMR transport
  (separate WS port). If the user develops behind a reverse proxy or in a
  remote dev container, HMR will fail to connect — set
  `hmr: { server: <httpServer>, clientPort: 4004 }` instead. Don't add this
  speculatively; only when the user reports HMR not connecting.

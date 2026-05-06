/**
 * Animates a ghost element from the source (typically the clicked book card's
 * cover) to the cart icon in the AppBar, then dispatches `cart:bump` so the
 * badge can react. Pure DOM — no React state or portals required.
 */
export function flyToCart(sourceEl: HTMLElement | null, imageUrl?: string | null) {
  if (typeof document === 'undefined') return
  const cartEl = document.querySelector('[data-cart-icon]') as HTMLElement | null
  if (!sourceEl || !cartEl) return

  // Prefer a cover image inside the same card if one is loaded — looks far
  // more satisfying than a flying icon button.
  const card = sourceEl.closest<HTMLElement>('[data-book-card], .MuiCard-root, .MuiPaper-root')
  const cover = card?.querySelector<HTMLElement>('[data-book-cover]') ?? card?.querySelector<HTMLElement>('img')
  const visualSource = cover ?? sourceEl

  const sourceRect = visualSource.getBoundingClientRect()
  const cartRect = cartEl.getBoundingClientRect()

  const ghost = document.createElement('div')
  ghost.setAttribute('aria-hidden', 'true')
  Object.assign(ghost.style, {
    position: 'fixed',
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    background: imageUrl
      ? `center/cover url(${JSON.stringify(imageUrl)})`
      : 'linear-gradient(135deg, #1A7B6E 0%, #E89C20 100%)',
    borderRadius: '8px',
    boxShadow: '0 14px 40px rgba(0,0,0,0.3)',
    transition:
      'transform 720ms cubic-bezier(0.36, 0, 0.66, -0.16), ' +
      'left 720ms cubic-bezier(0.36, 0, 0.66, -0.16), ' +
      'top 720ms cubic-bezier(0.36, 0, 0.66, -0.16), ' +
      'width 720ms ease-in, height 720ms ease-in, ' +
      'opacity 720ms ease-in',
    transformOrigin: 'center',
    zIndex: '2000',
    pointerEvents: 'none',
    willChange: 'transform, left, top, width, height, opacity',
  } satisfies Partial<CSSStyleDeclaration>)

  document.body.appendChild(ghost)

  // Force reflow so the initial styles "stick" before we transition.
  void ghost.getBoundingClientRect()

  const targetSize = 28
  requestAnimationFrame(() => {
    ghost.style.left = `${cartRect.left + cartRect.width / 2 - targetSize / 2}px`
    ghost.style.top = `${cartRect.top + cartRect.height / 2 - targetSize / 2}px`
    ghost.style.width = `${targetSize}px`
    ghost.style.height = `${targetSize}px`
    ghost.style.opacity = '0.4'
    ghost.style.transform = 'rotate(540deg)'
  })

  const cleanup = () => {
    ghost.remove()
    window.dispatchEvent(new CustomEvent('cart:bump'))
  }
  ghost.addEventListener('transitionend', cleanup, { once: true })
  setTimeout(cleanup, 900)
}

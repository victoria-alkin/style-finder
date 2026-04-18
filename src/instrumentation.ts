export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { STORES } = await import('./lib/stores');
    const { fetchStoreProducts } = await import('./lib/shopify');

    console.log('[cache] Pre-warming product cache for', STORES.length, 'stores…');

    Promise.all(STORES.map((s) => fetchStoreProducts(s.domain)))
      .then((results) => {
        const total = results.reduce((sum, r) => sum + r.length, 0);
        console.log(`[cache] Ready — ${total} products cached across ${STORES.length} stores`);
      })
      .catch((err) => console.warn('[cache] Pre-warm error:', err));
  }
}

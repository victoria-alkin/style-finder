export interface ShopifyVariant {
  id: number;
  title: string;
  price: string;
  available: boolean;
  option1?: string;
  option2?: string;
}

export interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  tags: string[];
  images: { src: string; alt?: string }[];
  variants: ShopifyVariant[];
  options: { name: string; values: string[] }[];
}

interface CacheEntry {
  products: ShopifyProduct[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000;       // 1 hour — hard expiry
const CACHE_REFRESH = 50 * 60 * 1000;   // 50 min — start background refresh

async function fetchFresh(domain: string): Promise<ShopifyProduct[]> {
  const res = await fetch(`https://${domain}/products.json?limit=250`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; FashionSearch/1.0)',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    console.warn(`[${domain}] responded with ${res.status}`);
    return [];
  }

  const data = await res.json();
  return data.products ?? [];
}

export async function fetchStoreProducts(domain: string): Promise<ShopifyProduct[]> {
  const cached = cache.get(domain);
  const age = cached ? Date.now() - cached.timestamp : Infinity;

  if (cached && age < CACHE_REFRESH) {
    return cached.products;
  }

  if (cached && age < CACHE_TTL) {
    // Stale-while-revalidate: return cached immediately, refresh in background
    fetchFresh(domain)
      .then((products) => cache.set(domain, { products, timestamp: Date.now() }))
      .catch((err) => console.warn(`[${domain}] background refresh failed:`, err));
    return cached.products;
  }

  // No cache or fully expired — blocking fetch
  try {
    const products = await fetchFresh(domain);
    cache.set(domain, { products, timestamp: Date.now() });
    return products;
  } catch (err) {
    console.warn(`[${domain}] fetch failed:`, err);
    return cached?.products ?? [];  // fall back to stale data rather than empty
  }
}

export function getLowestPrice(product: ShopifyProduct): number {
  const prices = product.variants
    .map((v) => parseFloat(v.price))
    .filter((p) => !isNaN(p));
  return prices.length ? Math.min(...prices) : 0;
}

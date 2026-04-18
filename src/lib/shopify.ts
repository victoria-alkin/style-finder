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
const CACHE_TTL = 60 * 60 * 1000;

export async function fetchStoreProducts(domain: string): Promise<ShopifyProduct[]> {
  const cached = cache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.products;
  }

  try {
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
    const products: ShopifyProduct[] = data.products ?? [];

    cache.set(domain, { products, timestamp: Date.now() });
    return products;
  } catch (err) {
    console.warn(`[${domain}] fetch failed:`, err);
    return [];
  }
}

export function getLowestPrice(product: ShopifyProduct): number {
  const prices = product.variants
    .map((v) => parseFloat(v.price))
    .filter((p) => !isNaN(p));
  return prices.length ? Math.min(...prices) : 0;
}

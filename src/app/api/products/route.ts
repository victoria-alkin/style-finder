import { NextRequest, NextResponse } from 'next/server';
import { STORES } from '@/lib/stores';
import { fetchStoreProducts } from '@/lib/shopify';
import { searchProducts } from '@/lib/search';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q') ?? '';
  const storeFilter = searchParams.get('store') ?? '';
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;

  const storeList = storeFilter ? STORES.filter((s) => s.domain === storeFilter) : STORES;

  const allEntries = (
    await Promise.all(
      storeList.map(async (store) => {
        const products = await fetchStoreProducts(store.domain);
        return products.map((product) => ({ product, store }));
      }),
    )
  ).flat();

  const results = searchProducts(allEntries, query, storeFilter || undefined, maxPrice, minPrice);

  return NextResponse.json({ results: results.slice(0, 120), total: results.length });
}

import { ShopifyProduct, getLowestPrice } from './shopify';
import { Store } from './stores';

export interface SearchResult {
  id: string;
  title: string;
  store: string;
  storeDomain: string;
  price: number;
  image: string;
  url: string;
  productType: string;
  tags: string[];
}

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'is', 'be', 'as', 'are', 'was',
  'i', 'me', 'my', 'we', 'want', 'looking', 'need', 'find', 'show',
  'something', 'type', 'style', 'item', 'get',
]);

const SYNONYMS: Record<string, string[]> = {
  dress: ['gown', 'frock'],
  gown: ['dress', 'frock'],
  pants: ['trousers', 'slacks', 'bottoms'],
  trousers: ['pants', 'slacks'],
  top: ['blouse', 'shirt', 'tee', 'tank'],
  blouse: ['top', 'shirt'],
  shirt: ['top', 'blouse', 'tee'],
  skirt: ['mini', 'midi', 'maxi'],
  mini: ['short', 'miniskirt'],
  midi: ['mid-length'],
  maxi: ['long', 'floor-length'],
  jumpsuit: ['romper', 'playsuit'],
  romper: ['jumpsuit', 'playsuit'],
  bodycon: ['fitted', 'tight', 'body-con'],
  floral: ['flower', 'botanical', 'bloom'],
  lace: ['lacy', 'lacey'],
  satin: ['silk', 'silky'],
  velvet: ['velour'],
  prom: ['formal', 'ball', 'gala', 'homecoming'],
  formal: ['prom', 'evening', 'gala', 'black-tie'],
  casual: ['everyday', 'relaxed'],
  cocktail: ['party', 'semi-formal'],
};

function expandQuery(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    const synonyms = SYNONYMS[token];
    if (synonyms) synonyms.forEach((s) => expanded.add(s));
  }
  return Array.from(expanded);
}

function scoreProduct(product: ShopifyProduct, tokens: string[]): number {
  const title = product.title.toLowerCase();
  const type = product.product_type.toLowerCase();
  const tags = (Array.isArray(product.tags) ? product.tags.join(' ') : product.tags ?? '').toLowerCase();
  const vendor = product.vendor.toLowerCase();
  const variantTitles = product.variants.map((v) => v.title.toLowerCase()).join(' ');

  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 4;
    else if (type.includes(token)) score += 3;
    else if (tags.includes(token)) score += 2;
    else if (variantTitles.includes(token)) score += 1;
    else if (vendor.includes(token)) score += 1;
  }
  return score;
}

export function searchProducts(
  entries: { product: ShopifyProduct; store: Store }[],
  query: string,
  storeFilter?: string,
  maxPrice?: number,
  minPrice?: number,
): SearchResult[] {
  const filtered = storeFilter
    ? entries.filter((e) => e.store.domain === storeFilter)
    : entries;

  const rawTokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ''))
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const tokens = expandQuery(rawTokens);

  const results: (SearchResult & { score: number })[] = [];

  for (const { product, store } of filtered) {
    const price = getLowestPrice(product);

    if (maxPrice !== undefined && price > maxPrice) continue;
    if (minPrice !== undefined && price < minPrice) continue;
    if (!product.images.length) continue;

    const score = tokens.length > 0 ? scoreProduct(product, tokens) : 1;
    if (tokens.length > 0 && score === 0) continue;

    results.push({
      id: `${store.domain}-${product.id}`,
      title: product.title,
      store: store.name,
      storeDomain: store.domain,
      price,
      image: product.images[0].src,
      url: `https://${store.domain}/products/${product.handle}`,
      productType: product.product_type,
      tags: product.tags ?? [],
      score,
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(({ score: _score, ...rest }) => rest);
}

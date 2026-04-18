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

function tokenTerms(token: string): string[] {
  return [token, ...(SYNONYMS[token] ?? [])];
}

function wordSet(text: string): Set<string> {
  return new Set(text.split(/[\s,\-\/\+&]+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter(Boolean));
}

function matchToken(token: string, fields: { titleWords: Set<string>; typeWords: Set<string>; tagWords: Set<string>; variantWords: Set<string>; vendorWords: Set<string> }): number {
  for (const term of tokenTerms(token)) {
    if (fields.titleWords.has(term)) return 4;
    if (fields.typeWords.has(term)) return 3;
    if (fields.tagWords.has(term)) return 2;
    if (fields.variantWords.has(term)) return 1;
    if (fields.vendorWords.has(term)) return 1;
  }
  return 0;
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

  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ''))
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const results: (SearchResult & { score: number })[] = [];

  for (const { product, store } of filtered) {
    const price = getLowestPrice(product);

    if (maxPrice !== undefined && price > maxPrice) continue;
    if (minPrice !== undefined && price < minPrice) continue;
    if (!product.images.length) continue;

    if (tokens.length === 0) {
      results.push({ id: `${store.domain}-${product.id}`, title: product.title, store: store.name, storeDomain: store.domain, price, image: product.images[0].src, url: `https://${store.domain}/products/${product.handle}`, productType: product.product_type, tags: product.tags ?? [], score: 1 });
      continue;
    }

    const fields = {
      titleWords: wordSet(product.title.toLowerCase()),
      typeWords: wordSet(product.product_type.toLowerCase()),
      tagWords: wordSet((product.tags ?? []).join(' ').toLowerCase()),
      variantWords: wordSet(product.variants.map((v) => v.title.toLowerCase()).join(' ')),
      vendorWords: wordSet(product.vendor.toLowerCase()),
    };

    let totalScore = 0;
    let allMatched = true;

    for (const token of tokens) {
      const tokenScore = matchToken(token, fields);
      if (tokenScore === 0) {
        allMatched = false;
        break;
      }
      totalScore += tokenScore;
    }

    if (!allMatched) continue;

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
      score: totalScore,
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .map(({ score: _score, ...rest }) => rest);
}

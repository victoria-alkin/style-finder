'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import StoreFilter from '@/components/StoreFilter';
import PriceFilter from '@/components/PriceFilter';
import ProductCard from '@/components/ProductCard';
import { SearchResult } from '@/lib/search';

type Status = 'idle' | 'loading' | 'done' | 'error';

export default function Home() {
  const [query, setQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (q: string, store: string, price: string) => {
    if (!q.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');

    try {
      const params = new URLSearchParams({ q });
      if (store) params.set('store', store);
      if (price) params.set('maxPrice', price);

      const res = await fetch(`/api/products?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setStatus('done');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (query) runSearch(query, storeFilter, maxPrice);
  }, [storeFilter, maxPrice, query, runSearch]);

  function handleSearch(q: string) {
    setQuery(q);
    runSearch(q, storeFilter, maxPrice);
  }

  function handleClear() {
    setQuery('');
    setResults([]);
    setStatus('idle');
    setStoreFilter('');
    setMaxPrice('');
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-neutral-900 font-serif">
              thread
            </span>
            <span className="text-xs text-neutral-300">|</span>
            <span className="text-xs text-neutral-400 tracking-[0.15em] uppercase hidden sm:block">
              fashion search
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors duration-150">Trending</a>
            <a href="#" className="hover:text-neutral-900 transition-colors duration-150">Stores</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="py-16 sm:py-24 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-5">
            Search across 10 fashion brands
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-3 leading-tight font-serif">
            Find exactly what you want.
          </h1>
          <p className="text-neutral-500 text-base mb-12 max-w-sm mx-auto leading-relaxed">
            Describe it in your own words — color, silhouette, occasion, vibe.
          </p>
          <SearchBar onSearch={handleSearch} onClear={handleClear} initialValue={query} />
        </section>

        {/* Filters */}
        {(status === 'done' || status === 'loading') && (
          <section className="pb-8 space-y-3">
            <StoreFilter selected={storeFilter} onChange={setStoreFilter} />
            <PriceFilter maxPrice={maxPrice} onChange={setMaxPrice} />
          </section>
        )}

        {/* Results */}
        <section className="pb-24">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-7 h-7 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
              <p className="text-sm text-neutral-400 tracking-wide">Searching across stores…</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-28">
              <p className="text-neutral-500 text-sm">Something went wrong. Please try again.</p>
            </div>
          )}

          {status === 'done' && results.length === 0 && (
            <div className="text-center py-28">
              <p className="text-2xl font-serif mb-2 text-neutral-900">No matches found</p>
              <p className="text-neutral-400 text-sm">Try a different description or remove a filter.</p>
            </div>
          )}

          {status === 'done' && results.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-sm text-neutral-400">
                  <span className="text-neutral-900 font-medium">{results.length}</span>
                  {total > results.length && ` of ${total}`} results
                  {query && (
                    <> for <span className="text-neutral-900 font-medium">&ldquo;{query}&rdquo;</span></>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-12">
                {results.map((result) => (
                  <ProductCard key={result.id} result={result} />
                ))}
              </div>
            </>
          )}

          {status === 'idle' && (
            <div className="text-center py-20">
              <p className="text-neutral-300 text-xs tracking-[0.2em] uppercase">
                Start typing to discover
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-neutral-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-neutral-400">
            Products sourced directly from brand stores. Prices and availability may vary.
          </p>
        </div>
      </footer>
    </div>
  );
}

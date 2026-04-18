'use client';

import { useState } from 'react';
import { STORES } from '@/lib/stores';

interface Props {
  selected: string;
  onChange: (domain: string) => void;
}

export default function StoreFilter({ selected, onChange }: Props) {
  const [storeSearch, setStoreSearch] = useState('');

  const visibleStores = storeSearch.trim()
    ? STORES.filter((s) => s.name.toLowerCase().includes(storeSearch.toLowerCase()))
    : STORES;

  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      {/* Search input — always full width, never scrolls with pills */}
      <div className="relative flex items-center self-start">
        <span className="absolute left-3 text-neutral-400 pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="text"
          value={storeSearch}
          onChange={(e) => setStoreSearch(e.target.value)}
          placeholder="Find a store…"
          className="pl-8 pr-7 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:border-neutral-400 w-36 placeholder:text-neutral-400"
        />
        {storeSearch && (
          <button
            onClick={() => setStoreSearch('')}
            className="absolute right-2.5 text-neutral-400 hover:text-neutral-700"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable pill row */}
      <div
        className="flex items-center gap-2 overflow-x-auto scrollbar-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <button
          onClick={() => onChange('')}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            selected === ''
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
          }`}
        >
          All Stores
        </button>

        {visibleStores.map((store) => (
          <button
            key={store.domain}
            onClick={() => onChange(store.domain)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              selected === store.domain
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
            }`}
          >
            {store.name}
          </button>
        ))}

        {visibleStores.length === 0 && (
          <span className="text-sm text-neutral-400 shrink-0">No stores match &ldquo;{storeSearch}&rdquo;</span>
        )}
      </div>
    </div>
  );
}

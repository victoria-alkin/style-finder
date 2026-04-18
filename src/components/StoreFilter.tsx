'use client';

import { STORES } from '@/lib/stores';

interface Props {
  selected: string;
  onChange: (domain: string) => void;
}

export default function StoreFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => onChange('')}
        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
          selected === ''
            ? 'bg-neutral-900 text-white border-neutral-900'
            : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
        }`}
      >
        All Stores
      </button>
      {STORES.map((store) => (
        <button
          key={store.domain}
          onClick={() => onChange(store.domain)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            selected === store.domain
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
          }`}
        >
          {store.name}
        </button>
      ))}
    </div>
  );
}

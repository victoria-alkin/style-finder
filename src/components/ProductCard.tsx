'use client';

import Image from 'next/image';
import { SearchResult } from '@/lib/search';

interface Props {
  result: SearchResult;
}

export default function ProductCard({ result }: Props) {
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-white overflow-hidden"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        <Image
          src={result.image}
          alt={result.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-medium px-2.5 py-1 rounded-full">
          {result.store}
        </span>
      </div>
      <div className="pt-3 pb-4 px-0.5">
        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-1">{result.store}</p>
        <h3 className="text-sm text-neutral-900 font-medium leading-snug line-clamp-2 group-hover:text-neutral-600 transition-colors">
          {result.title}
        </h3>
        <p className="mt-2 text-sm font-semibold text-neutral-900">
          {result.price > 0 ? `$${result.price.toFixed(2)}` : '—'}
        </p>
      </div>
    </a>
  );
}

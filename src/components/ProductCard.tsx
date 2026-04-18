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
      className="group flex flex-col cursor-pointer border border-neutral-200 rounded-md overflow-hidden hover:border-neutral-400 transition-colors duration-150"
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
        {/* Hover overlay with Shop Now CTA */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-center pb-5 opacity-0 group-hover:opacity-100">
          <span className="bg-white text-neutral-900 text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-md">
            Shop Now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-medium px-2.5 py-1 rounded-full">
          {result.store}
        </span>
      </div>
      <div className="pt-3 pb-3 px-3">
        <h3 className="text-sm text-neutral-900 font-medium leading-snug line-clamp-2 group-hover:text-neutral-500 transition-colors duration-150">
          {result.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900">
            {result.price > 0 ? `$${result.price.toFixed(2)}` : '—'}
          </p>
          <span className="text-xs text-neutral-400 group-hover:text-neutral-700 transition-colors duration-150 flex items-center gap-1">
            View
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17 17 7M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
}

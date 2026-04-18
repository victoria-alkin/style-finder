'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';

interface Props {
  onSearch: (query: string) => void;
  onClear?: () => void;
  initialValue?: string;
}

const SUGGESTIONS = [
  'red mermaid prom dress',
  'black linen wide-leg pants',
  'white square-neck tank top',
  'emerald green satin midi dress',
  'floral wrap dress',
  'one-shoulder bodycon dress',
  'velvet blazer',
  'ruched cocktail dress',
];

export default function SearchBar({ onSearch, onClear, initialValue = '' }: Props) {
  const [value, setValue] = useState(initialValue);
  const [placeholder, setPlaceholder] = useState('');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let charIndex = 0;
    let typing = true;
    let timeout: ReturnType<typeof setTimeout>;

    const current = SUGGESTIONS[suggestionIndex];

    function tick() {
      if (typing) {
        charIndex++;
        setPlaceholder(current.slice(0, charIndex));
        if (charIndex < current.length) {
          timeout = setTimeout(tick, 45);
        } else {
          typing = false;
          timeout = setTimeout(tick, 1800);
        }
      } else {
        charIndex--;
        setPlaceholder(current.slice(0, charIndex));
        if (charIndex > 0) {
          timeout = setTimeout(tick, 22);
        } else {
          typing = true;
          setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
        }
      }
    }

    timeout = setTimeout(tick, 400);
    return () => clearTimeout(timeout);
  }, [suggestionIndex]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  }

  function handleClear() {
    setValue('');
    onClear?.();
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center group">
        <span className="absolute left-5 text-neutral-400 pointer-events-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || 'Search for anything...'}
          className="w-full pl-12 pr-32 py-4 text-base bg-white border border-neutral-200 rounded-full shadow-sm focus:outline-none focus:border-neutral-900 focus:shadow-md transition-all duration-200 placeholder:text-neutral-400"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 text-neutral-400 hover:text-neutral-700 transition-colors duration-150 p-1"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-700 transition-colors duration-150"
        >
          Search
        </button>
      </div>
    </form>
  );
}

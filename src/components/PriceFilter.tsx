'use client';

interface Props {
  maxPrice: string;
  onChange: (max: string) => void;
}

const PRICE_OPTIONS = [
  { label: 'Any price', value: '' },
  { label: 'Under $50', value: '50' },
  { label: 'Under $100', value: '100' },
  { label: 'Under $200', value: '200' },
  { label: 'Under $300', value: '300' },
];

export default function PriceFilter({ maxPrice, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRICE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
            maxPrice === opt.value
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-neutral-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

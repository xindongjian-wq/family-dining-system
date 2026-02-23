'use client';

import { CATEGORIES, CATEGORY_COLORS, type Category } from '@/lib/types';

interface Props {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelect('all')}
        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
          selected === 'all'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        全部
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
            selected === cat
              ? CATEGORY_COLORS[cat].replace('bg-', 'bg-').replace('text-', 'text-white ')
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

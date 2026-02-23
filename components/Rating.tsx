'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface Props {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export function Rating({ value = 0, onChange, readonly = false }: Props) {
  const [hover, setHover] = useState(0);

  if (readonly) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={20}
            className={i <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange?.(i)}
          className="transition-transform active:scale-90"
        >
          <Star
            size={24}
            className={
              i <= (hover || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-gray-300 hover:text-amber-200'
            }
          />
        </button>
      ))}
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Utensils } from 'lucide-react';

interface Props {
  dish: {
    id: number;
    title: string;
    metadata?: {
      image?: string;
      description?: string;
      rating_count?: number;
      rating_sum?: number;
      order_count?: number;
    };
  };
}

export function DishCard({ dish }: Props) {
  const metadata = dish.metadata || {};
  const rating = metadata.rating_count && metadata.rating_sum
    ? (metadata.rating_sum / metadata.rating_count).toFixed(1)
    : null;

  return (
    <Link href={`/dish/${dish.id}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group">
        <div className="relative aspect-square bg-gray-100">
          {metadata.image ? (
            <Image
              src={metadata.image}
              alt={dish.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Utensils size={48} />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium truncate text-gray-900">{dish.title}</h3>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Utensils size={14} />
              {metadata.order_count || 0}次
            </span>
            {rating && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={14} fill="currentColor" />
                {rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

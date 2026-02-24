'use client';

import Link from 'next/link';
import { Star, Utensils } from 'lucide-react';
import { useState } from 'react';

// 临时显示图片 URL 用于调试
const SHOW_IMAGE_URL = true;

interface Props {
  dish: {
    id: number;
    number?: number;
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

  // 使用 number 而不是 id（GitHub issue id 是全局大数字，number 才是仓库编号）
  const issueNumber = dish.number || dish.id;

  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/dish/${issueNumber}`}>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group">
        <div className="relative aspect-square bg-gray-100">
          {metadata.image && !imageError ? (
            <img
              src={metadata.image}
              alt={dish.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Utensils size={48} />
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium truncate text-gray-900">{dish.title}</h3>
          {SHOW_IMAGE_URL && metadata.image && (
            <div className="text-xs text-gray-400 mt-1 truncate" title={metadata.image}>
              📷 {metadata.image.substring(0, 40)}...
            </div>
          )}
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

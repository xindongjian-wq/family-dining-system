'use client';

import { useEffect, useState, useCallback } from 'react';
import { DishCard } from '@/components/DishCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import { Utensils, Plus, BookOpen } from 'lucide-react';

export default function HomePage() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('q', searchQuery);

      const res = await fetch(`/api/dishes?${params}`);
      const data = await res.json();
      setDishes(data);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Utensils className="text-orange-500" />
            今天吃什么
          </h1>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* Category Filter */}
      <div className="bg-white border-b">
        <div className="max-w-4xl px-4 py-3">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </div>

      {/* Dish Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : dishes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
            <p>暂无菜品</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {dishes.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-3 max-w-4xl mx-auto">
          <a
            href="/"
            className="flex flex-col items-center text-orange-600 font-medium"
          >
            <Utensils size={24} />
            <span className="text-xs mt-1">菜单</span>
          </a>
          <a
            href="/add-dish"
            className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition"
          >
            <Plus size={24} />
            <span className="text-xs mt-1">添加</span>
          </a>
          <a
            href="/diary"
            className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition"
          >
            <BookOpen size={24} />
            <span className="text-xs mt-1">日记</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

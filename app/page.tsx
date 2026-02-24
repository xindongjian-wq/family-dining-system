'use client';

import { useEffect, useState, useCallback } from 'react';
import { DishCard } from '@/components/DishCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBar } from '@/components/SearchBar';
import LoginModal from '@/components/LoginModal';
import { useUser } from '@/contexts/UserContext';
import { Utensils, Plus, BookOpen, AlertCircle, LogOut, User } from 'lucide-react';

export default function HomePage() {
  const { userName, logout } = useUser();
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('q', searchQuery);

      const res = await fetch(`/api/dishes?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '获取菜品失败');
        setDishes([]);
        return;
      }

      // 确保 data 是数组
      if (Array.isArray(data)) {
        setDishes(data);
      } else {
        console.error('API 返回的不是数组:', data);
        setDishes([]);
        setError('数据格式错误');
      }
    } catch (err) {
      console.error('Failed to fetch dishes:', err);
      setError('网络错误，请检查配置');
      setDishes([]);
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Utensils className="text-orange-500" />
              今天吃什么
            </h1>
            {userName && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full">
                  <User size={16} className="text-orange-500" />
                  <span className="text-sm font-medium text-orange-700">{userName}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                  title="退出登录"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
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

      {/* Error State */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-700 font-medium">加载失败</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={fetchDishes}
                className="mt-2 text-sm text-red-700 underline"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : !error && dishes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
            <p>暂无菜品</p>
          </div>
        ) : !error && (
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

      {/* Login Modal */}
      <LoginModal />
    </div>
  );
}

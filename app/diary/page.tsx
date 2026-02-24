'use client';

import { useEffect, useState } from 'react';
import { formatTime, formatFullTime, groupByDate } from '@/lib/utils';
import { BookOpen, Clock, User as UserIcon, Utensils } from 'lucide-react';

export default function DiaryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/diary');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch diary:', error);
    } finally {
      setLoading(false);
    }
  }

  const groupedOrders = groupByDate(orders, 'timestamp');
  const dates = Object.keys(groupedOrders).sort((a, b) => {
    // 简单排序，今天在最前
    if (a === '今天') return -1;
    if (b === '今天') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-4">
          <BookOpen className="text-orange-500 mr-2" size={24} />
          <h1 className="text-xl font-bold">吃饭日记</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Utensils size={48} className="mx-auto mb-4 text-gray-300" />
            <p>还没有点餐记录</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map((date) => (
              <div key={date}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3 sticky top-0 bg-gray-50 py-2">
                  {date}
                </h2>
                <div className="space-y-3">
                  {groupedOrders[date].map((order: any, idx: number) => (
                    <div
                      key={order.id || idx}
                      className="bg-white rounded-xl p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium flex-shrink-0">
                          {order.user?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">
                              {order.user}
                            </span>
                            <span className="text-gray-400">吃了</span>
                            <span className="font-medium text-orange-600">
                              {order.dish_name}
                            </span>
                            {order.rating > 0 && (
                              <span className="text-amber-500 text-sm">
                                ★ {order.rating}
                              </span>
                            )}
                          </div>
                          {order.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {order.comment}
                            </p>
                          )}
                          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock size={12} />
                            {formatFullTime(order.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex justify-around py-3 max-w-4xl mx-auto">
          <a
            href="/"
            className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition"
          >
            <Utensils size={24} />
            <span className="text-xs mt-1">菜单</span>
          </a>
          <a
            href="/add-dish"
            className="flex flex-col items-center text-gray-600 hover:text-orange-600 transition"
          >
            <div className="relative">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <span className="text-xs mt-1">添加</span>
          </a>
          <a
            href="/diary"
            className="flex flex-col items-center text-orange-600 font-medium"
          >
            <BookOpen size={24} />
            <span className="text-xs mt-1">日记</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

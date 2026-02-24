'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Rating } from '@/components/Rating';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Clock, Edit, Utensils } from 'lucide-react';
import { formatTime } from '@/lib/utils';

export default function DishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { userName, isLoggedIn } = useUser();
  const [dish, setDish] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDish = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dish/${params.id}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '获取菜品失败');
        setDish(null);
        return;
      }

      setDish(data.issue);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch dish:', err);
      setError('网络错误，请重试');
      setDish(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDish();
  }, [fetchDish]);

  async function handleOrder() {
    if (!userName) {
      alert('请先登录');
      router.push('/');
      return;
    }

    // 使用 issue number 而不是 params.id
    const issueNumber = dish?.number || dish?.id;

    setSubmitting(true);
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dish_id: issueNumber,
          user: userName,
          rating: userRating,
          comment: userComment,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '点菜失败，请重试');
        return;
      }

      alert('点菜成功！');
      setUserRating(0);
      setUserComment('');
      fetchDish();
    } catch (err) {
      alert('点菜失败，请重试');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-gray-500">{error || '菜品不存在'}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg"
        >
          返回
        </button>
      </div>
    );
  }

  const metadata = dish.metadata || {};
  const avgRating = metadata.rating_count && metadata.rating_sum
    ? (metadata.rating_sum / metadata.rating_count).toFixed(1)
    : '-';

  // 使用 number 而不是 id
  const issueNumber = dish.number || dish.id;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center pr-16">
            菜品详情
          </h1>
          <button
            onClick={() => router.push(`/edit-dish/${issueNumber}`)}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-full text-orange-500"
            title="编辑菜品"
          >
            <Edit size={24} />
          </button>
        </div>
      </header>

      {/* Image */}
      {metadata.image && (
        <div className="relative w-full aspect-video bg-gray-100">
          <Image
            src={metadata.image}
            alt={dish.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Info */}
      <div className="bg-white p-4 mb-2">
        <h2 className="text-2xl font-bold mb-2">{dish.title}</h2>

        {metadata.description && (
          <p className="text-gray-600 mb-4">{metadata.description}</p>
        )}

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Utensils size={16} />
            <span>已点 {metadata.order_count || 0} 次</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>评分 {avgRating}</span>
          </div>
          {metadata.rating_count > 0 && (
            <div className="text-gray-400">
              ({metadata.rating_count} 人评分)
            </div>
          )}
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-white p-4 mb-2">
        <h3 className="font-semibold mb-4">
          {userName ? `想吃这道菜，${userName}？` : '想吃这道菜？'}
        </h3>

        {userName && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <span>以</span>
            <span className="font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">{userName}</span>
            <span>的名义点菜</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">评分（可选）</label>
            <Rating value={userRating} onChange={setUserRating} />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">备注（可选）</label>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="有什么想说的..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
          </div>

          <button
            onClick={handleOrder}
            disabled={submitting || !userName}
            className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {submitting ? '提交中...' : '我想吃这个！'}
          </button>

          {!userName && (
            <p className="text-center text-sm text-gray-500">
              请先<a href="/" className="text-orange-500 hover:underline">登录</a>后点菜
            </p>
          )}
        </div>
      </div>

      {/* Order History */}
      {orders.length > 0 && (
        <div className="bg-white p-4">
          <h3 className="font-semibold mb-4">点菜记录</h3>
          <div className="space-y-3">
            {orders.slice(0, 10).map((order, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium flex-shrink-0">
                  {order.user?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{order.user}</span>
                    {order.rating > 0 && (
                      <span className="text-amber-500 text-sm">★ {order.rating}</span>
                    )}
                  </div>
                  {order.comment && (
                    <p className="text-sm text-gray-600 mt-1">{order.comment}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {formatTime(order.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

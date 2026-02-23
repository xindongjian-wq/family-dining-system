import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { buildOrderComment, parseDishMetadata } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { dish_id, user, rating, comment } = await request.json();

    if (!dish_id || !user) {
      return NextResponse.json({ error: 'dish_id and user are required' }, { status: 400 });
    }

    // 获取菜品信息
    const dish = await githubApi.getDish(dish_id);
    const dishTitle = dish.issue.title;
    const metadata = parseDishMetadata(dish.issue.body || '');

    // 构建订单评论
    const orderComment = buildOrderComment({
      dish_id,
      dish_name: dishTitle,
      user,
      rating,
      comment,
    });

    // 添加评论
    await githubApi.addOrder(dish_id, orderComment);

    // 更新元数据（评分统计）
    let newRatingSum = metadata.rating_sum || 0;
    let newRatingCount = metadata.rating_count || 0;
    let newOrderCount = (metadata.order_count || 0) + 1;

    if (rating && rating > 0) {
      newRatingSum += rating;
      newRatingCount += 1;
    }

    const newBody = `---
image: ${metadata.image || ''}
description: ${metadata.description || ''}
rating_count: ${newRatingCount}
rating_sum: ${newRatingSum}
order_count: ${newOrderCount}
created_at: ${metadata.created_at || new Date().toISOString().split('T')[0]}
---

${metadata.description || ''}`;

    await githubApi.updateDish(dish_id, newBody);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

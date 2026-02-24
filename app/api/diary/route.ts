import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseOrderComment } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allComments = await githubApi.getAllComments();

    console.log('Total comments:', allComments.length);

    // 解析订单记录
    const orders = allComments
      .map(c => {
        const parsed = c.body ? parseOrderComment(c.body) : null;
        if (!parsed || parsed.type !== 'order') return null;

        return {
          ...parsed,
          id: c.id,
          created_at: c.created_at,
          dish_title: (c as any).dish_title,
          // 确保 dish_name 存在（优先使用解析的，否则用 API 传递的）
          dish_name: parsed.dish_name || (c as any).dish_title,
        };
      })
      .filter(c => c !== null);

    console.log('Parsed orders:', orders.length);

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Failed to fetch diary:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch diary' }, { status: 500 });
  }
}

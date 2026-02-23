import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseOrderComment } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allComments = await githubApi.getAllComments();

    // 解析订单记录
    const orders = allComments
      .map(c => {
        const parsed = c.body ? parseOrderComment(c.body) : null;
        return {
          ...parsed,
          id: c.id,
          created_at: c.created_at,
          dish_title: (c as any).dish_title,
        };
      })
      .filter(c => c && c.type === 'order');

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Failed to fetch diary:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch diary' }, { status: 500 });
  }
}

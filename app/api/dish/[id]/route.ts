import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseDishMetadata, parseOrderComment } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET - 获取菜品详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { issue, comments } = await githubApi.getDish(parseInt(id));

    // 解析订单记录
    const orders = comments
      .map(c => (c.body ? parseOrderComment(c.body) : null))
      .filter(c => c && c.type === 'order');

    return NextResponse.json({
      issue: {
        ...issue,
        metadata: parseDishMetadata(issue.body || ''),
      },
      comments,
      orders,
    });
  } catch (error: any) {
    console.error('Failed to fetch dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dish' }, { status: 500 });
  }
}

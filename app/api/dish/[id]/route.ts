import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseDishMetadata, parseOrderComment, buildDishMetadata } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// GET - 获取菜品详情
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issueNumber = parseInt(id);

    if (isNaN(issueNumber)) {
      return NextResponse.json({ error: 'Invalid dish ID' }, { status: 400 });
    }

    console.log('Fetching dish:', issueNumber);

    const { issue, comments } = await githubApi.getDish(issueNumber);

    // 解析订单记录
    const orders = comments
      .map((c: any) => (c.body ? parseOrderComment(c.body) : null))
      .filter((c: any) => c && c.type === 'order');

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

// PATCH - 更新菜品
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issueNumber = parseInt(id);

    if (isNaN(issueNumber)) {
      return NextResponse.json({ error: 'Invalid dish ID' }, { status: 400 });
    }

    const { title, description, category, image } = await request.json();

    // 获取现有菜品数据
    const { issue } = await githubApi.getDish(issueNumber);
    const metadata = parseDishMetadata(issue.body || '');

    // 更新元数据
    const newMetadata = {
      ...metadata,
      image: image || metadata.image || '',
      description: description || metadata.description || '',
    };

    // 构建新的 body
    const newBody = `---
image: ${newMetadata.image}
description: ${newMetadata.description}
rating_count: ${metadata.rating_count || 0}
rating_sum: ${metadata.rating_sum || 0}
order_count: ${metadata.order_count || 0}
created_at: ${metadata.created_at || new Date().toISOString().split('T')[0]}
---

${newMetadata.description}`;

    // 更新 issue
    await githubApi.updateDish(issueNumber, newBody);

    // 如果标题或分类改变了，需要更新 labels
    if (title && title !== issue.title) {
      // GitHub API 不支持直接修改标题，需要用另一种方式
      // 暂时只返回成功，标题更新需要另外处理
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

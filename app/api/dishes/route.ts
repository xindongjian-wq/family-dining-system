import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseDishMetadata } from '@/lib/utils';
import type { Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

// GET - 获取菜品列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q');

    let issues = await githubApi.getDishes();

    // 过滤分类
    if (category && category !== 'all') {
      issues = issues.filter((issue: any) =>
        issue.labels.some((l: any) => typeof l === 'object' && l && 'name' in l && l.name === `category:${category}`)
      );
    }

    // 搜索
    if (search) {
      const query = search.toLowerCase();
      issues = issues.filter((issue: any) =>
        issue.title.toLowerCase().includes(query) ||
        (issue.body && issue.body.toLowerCase().includes(query))
      );
    }

    const dishes = issues.map((issue: any) => ({
      ...issue,
      metadata: parseDishMetadata(issue.body || ''),
    }));

    return NextResponse.json(dishes);
  } catch (error: any) {
    console.error('Failed to fetch dishes:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dishes' }, { status: 500 });
  }
}

// POST - 创建菜品
export async function POST(request: Request) {
  try {
    const { title, description, category, image } = await request.json();

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    const metadata = {
      image: image || '',
      description: description || '',
      rating_count: 0,
      rating_sum: 0,
      order_count: 0,
      created_at: new Date().toISOString().split('T')[0],
    };

    const body = `---
image: ${metadata.image}
description: ${metadata.description}
rating_count: ${metadata.rating_count}
rating_sum: ${metadata.rating_sum}
order_count: ${metadata.order_count}
created_at: ${metadata.created_at}
---

${description || ''}`;

    const result = await githubApi.createDish(title, body, [`category:${category}`]);

    return NextResponse.json(result.data);
  } catch (error: any) {
    console.error('Failed to create dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to create dish' }, { status: 500 });
  }
}

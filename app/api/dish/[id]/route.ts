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
      image: image !== undefined ? image : metadata.image,
      description: description !== undefined ? description : metadata.description,
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

    // 准备更新数据
    const updateData: any = { body: newBody };

    // 更新标题
    if (title && title !== issue.title) {
      updateData.title = title;
    }

    // 处理分类标签
    const oldCategoryLabel = issue.labels?.find((l: any) =>
      l.name && l.name.startsWith('category:')
    );
    const oldCategory = oldCategoryLabel?.name.replace('category:', '');

    if (category && category !== oldCategory) {
      // 移除旧的 category 标签，添加新的
      const otherLabels = issue.labels
        .filter((l: any) => !l.name.startsWith('category:'))
        .map((l: any) => l.name);
      updateData.labels = [...otherLabels, `category:${category}`];
    }

    // 调用 GitHub API 更新
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
    const GITHUB_REPO = process.env.GITHUB_REPO || '';
    const [owner, repo] = GITHUB_REPO.split('/');

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(`GitHub API error: ${res.status} - ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to update dish' }, { status: 500 });
  }
}

// DELETE - 删除菜品（关闭 issue）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issueNumber = parseInt(id);

    if (isNaN(issueNumber)) {
      return NextResponse.json({ error: 'Invalid dish ID' }, { status: 400 });
    }

    await githubApi.deleteDish(issueNumber);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete dish:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete dish' }, { status: 500 });
  }
}

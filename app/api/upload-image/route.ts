import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';

export const dynamic = 'force-dynamic';

// POST - 上传图片到 GitHub
export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // 提取 base64 数据（去掉 data:image/jpeg;base64, 前缀）
    const base64Data = image.split(',')[1] || image;

    // 生成唯一文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const filename = `images/${timestamp}-${random}.jpg`;

    // 上传到 GitHub
    const result = await githubApi.uploadImage(filename, base64Data);

    // GitHub API 返回的 URL 优先级：download_url > git_url > 自己构建
    const GITHUB_REPO = process.env.GITHUB_REPO || '';
    const [owner, repo] = GITHUB_REPO.split('/');
    const branch = result.content.sha ? 'main' : 'main'; // 使用 main 分支

    // 使用 GitHub raw 内容 URL（最稳定）
    const imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}

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

    console.log('GitHub upload result:', JSON.stringify(result, null, 2));

    // GitHub API 返回多种 URL，优先使用 download_url
    // 如果 download_url 不存在，则构建 raw.githubusercontent.com URL
    let imageUrl = result.content?.download_url;

    if (!imageUrl) {
      const GITHUB_REPO = process.env.GITHUB_REPO || '';
      const [owner, repo] = GITHUB_REPO.split('/');
      // 获取默认分支（通常是 main 或 master）
      imageUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`;
    }

    console.log('Final image URL:', imageUrl);

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}

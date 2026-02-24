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

    // 返回图片的 raw URL
    const imageUrl = result.content.download_url || result.content.raw_url || `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/main/${filename}`;

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload image' }, { status: 500 });
  }
}

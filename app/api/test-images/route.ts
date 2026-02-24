import { NextResponse } from 'next/server';
import { githubApi } from '@/lib/github';
import { parseDishMetadata } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dishes = await githubApi.getDishes();

    const results = dishes.slice(0, 5).map((dish: any) => {
      const metadata = parseDishMetadata(dish.body || '');
      return {
        title: dish.title,
        number: dish.number,
        image: metadata.image || '(无图片)',
        imageLength: metadata.image?.length || 0,
        hasImage: !!metadata.image,
      };
    });

    return NextResponse.json({
      total: dishes.length,
      samples: results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

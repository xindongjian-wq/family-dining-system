import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    token: process.env.GITHUB_TOKEN ? 'OK' : 'MISSING',
    repo: process.env.GITHUB_REPO || 'MISSING',
  });
}

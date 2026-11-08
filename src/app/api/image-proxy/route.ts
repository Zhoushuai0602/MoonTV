import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const revalidate = 0;

// 简单白名单，只允许豆瓣图片域名
const ALLOW_HOSTS = new Set(['img3.doubanio.com','img9.doubanio.com','img1.doubanio.com']);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
  }

  let imageUrl: URL;
  try {
    imageUrl = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!ALLOW_HOSTS.has(imageUrl.hostname)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 });
  }

  try {
    const imageResponse = await fetch(rawUrl, {
      redirect: 'follow',
      headers: {
        Referer: 'https://movie.douban.com/',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Source fetch failed: ${imageResponse.statusText}` },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get('content-type');
    if (!imageResponse.body) {
      return NextResponse.json({ error: 'Empty image stream' }, { status: 500 });
    }

    const headers = new Headers();
    if (contentType) headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000');
    headers.set('CDN-Cache-Control', 'public, s-maxage=15720000');
    headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=15720000');

    return new Response(imageResponse.body, { status: 200, headers });
  } catch (err) {
    console.error('proxy err:', err);
    return NextResponse.json({ error: 'Fetch source image failed' }, { status: 500 });
  }
}

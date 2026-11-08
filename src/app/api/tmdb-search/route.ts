export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server'
const TMDB_API_KEY = "7d9632d48ad1b14bf6bb3b79f3580c1c"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")
  if (!q) return NextResponse.json({error: "缺少关键词q"}, {status:400})

  const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=zh-CN`
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
    }
  })
  const data = await res.json()
  return NextResponse.json(data)
}

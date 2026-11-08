.import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = "7d9632d48ad1b14bf6bb3b79f3580c1c"
const ALLOW_HOSTS = [
  "image.tmdb.org"
]

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const posterPath = searchParams.get("path")
    if (!posterPath) {
      return NextResponse.json({ err: "缺少 path 参数" }, { status: 400 })
    }

    const imgUrl = `https://image.tmdb.org/t/p/original${posterPath}`
    const host = new URL(imgUrl).hostname
    if (!ALLOW_HOSTS.includes(host)) {
      return NextResponse.json({ err: "域名不允许" }, { status: 403 })
    }

    const res = await fetch(imgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
      }
    })
    if (!res.ok) {
      return NextResponse.json({ err: "图片获取失败" }, { status: res.status })
    }

    const buf = await res.arrayBuffer()
    const contentType = res.headers.get("content-type") || "image/jpeg"

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      }
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ err: "代理异常" }, { status: 500 })
  }
}

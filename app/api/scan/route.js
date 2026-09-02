import { NextResponse } from "next/server"
import { checkScanTarget } from "../../../lib/safe-url.js"
import { scan } from "../../../scan.js"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * A scan costs a browser launch — seconds of CPU, hundreds of MB of RAM. That
 * is orders of magnitude more expensive than a normal request, so this endpoint
 * is the one place on the site where an unthrottled caller can take the box
 * down. Hence a hard concurrency cap AND a per-IP rate limit: the cap protects
 * the machine from everyone at once, the limit protects it from one persistent
 * caller. Memory-resident and therefore per-process, which is the right size of
 * solution while this runs as a single container.
 */
const WINDOW_MS = 60_000
const PER_IP_PER_WINDOW = 5
const MAX_CONCURRENT = 2

const hits = new Map()
let inFlight = 0

function rateLimited(ip) {
  const now = Date.now()
  const rec = hits.get(ip)
  if (!rec || now > rec.reset) {
    hits.set(ip, { n: 1, reset: now + WINDOW_MS })
    return false
  }
  rec.n += 1
  return rec.n > PER_IP_PER_WINDOW
}

// The map would otherwise grow with every distinct caller forever.
setInterval(() => {
  const now = Date.now()
  for (const [ip, rec] of hits) if (now > rec.reset) hits.delete(ip)
}, WINDOW_MS).unref?.()

export async function POST(req) {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"

  if (rateLimited(ip))
    return NextResponse.json(
      { error: "That is a lot of scans in a minute. Try again shortly." },
      { status: 429 },
    )

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 })
  }

  const check = await checkScanTarget(body?.url || "")
  if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 400 })

  if (inFlight >= MAX_CONCURRENT)
    return NextResponse.json(
      { error: "Busy scanning for someone else. Try again in a few seconds." },
      { status: 503 },
    )

  inFlight += 1
  try {
    const result = await scan(check.url)
    return NextResponse.json(result)
  } catch (e) {
    // The URL resolved and passed the safety check, so a failure here is the
    // site's behaviour, not the caller's mistake — say which.
    return NextResponse.json(
      { error: `Could not load that page: ${String(e?.message || e).slice(0, 200)}` },
      { status: 502 },
    )
  } finally {
    inFlight -= 1
  }
}

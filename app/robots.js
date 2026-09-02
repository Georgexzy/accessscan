
// Per request, for the same reason as the sitemap: it advertises the
// sitemap's absolute URL and must not hardcode the build host.
export const dynamic = "force-dynamic"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default function robots() {
  return {
    // /api/scan is a POST endpoint that launches a browser. There is nothing
    // for a crawler to fetch there and every reason not to invite it to try.
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}

import { rules } from "../lib/rules.js"
import { GUIDES } from "../content/guides.js"

// Rendered per request. NEXT_PUBLIC_SITE_URL is not known at image build
// time — baking it produced a sitemap of http://localhost:3000 URLs, and a
// sitemap of localhost submitted to a search engine is worse than none.
export const dynamic = "force-dynamic"


const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default function sitemap() {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/fix`, changeFrequency: "weekly", priority: 0.9 },
    ...rules.map((r) => ({
      url: `${SITE}/fix/${r.id}`,
      changeFrequency: "monthly",
      // The six that carry 96% of real-world errors are the pages worth
      // crawling most often, and saying so is accurate rather than flattering.
      priority: GUIDES[r.id] ? 0.9 : 0.6,
    })),
    ...Object.entries(GUIDES).flatMap(([rule, g]) =>
      Object.keys(g.platforms || {}).map((platform) => ({
        url: `${SITE}/fix/${rule}/${platform}`,
        changeFrequency: "monthly",
        priority: 0.8,
      })),
    ),
  ]
}

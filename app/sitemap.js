import { rules } from "../lib/rules.js"

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export default function sitemap() {
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/fix`, changeFrequency: "weekly", priority: 0.9 },
    ...rules.map((r) => ({
      url: `${SITE}/fix/${r.id}`,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ]
}

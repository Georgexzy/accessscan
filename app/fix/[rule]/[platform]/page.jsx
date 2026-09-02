import { notFound } from "next/navigation"
import { ruleById, HEADLINE } from "../../../../lib/rules.js"
import { GUIDES, guideFor } from "../../../../content/guides.js"
import { PLATFORM_LABEL } from "../../../../lib/platforms.js"

/**
 * Only the combinations we actually wrote something for.
 *
 * The alternative — every rule crossed with every platform — would generate
 * hundreds of pages that differ by a noun. This route exists precisely because
 * the platform CHANGES the answer; where it does not, there is no page.
 */
export function generateStaticParams() {
  const out = []
  for (const [rule, g] of Object.entries(GUIDES))
    for (const platform of Object.keys(g.platforms || {})) out.push({ rule, platform })
  return out
}

export async function generateMetadata({ params }) {
  const { rule, platform } = await params
  const r = ruleById(rule)
  const g = guideFor(rule)
  const label = PLATFORM_LABEL[platform]
  if (!r || !g?.platforms?.[platform] || !label) return {}
  return {
    title: `How to fix ${r.help.toLowerCase()} in ${label}`,
    description: `${r.help} on ${label}: where the problem actually lives, and the change that fixes it without being overwritten by the next update. WCAG ${r.criteria[0] || ""} level ${r.level}.`,
  }
}

export default async function PlatformPage({ params }) {
  const { rule, platform } = await params
  const r = ruleById(rule)
  const g = guideFor(rule)
  const note = g?.platforms?.[platform]
  const label = PLATFORM_LABEL[platform]
  if (!r || !note || !label) notFound()
  const h = HEADLINE[r.id]

  return (
    <>
      <p style={{ color: "var(--faint)", fontSize: 14 }}>
        <a href={`/fix/${r.id}`}>{r.help}</a> → {label}
      </p>
      <h1>Fixing “{r.help}” in {label}</h1>
      <p className="lede">
        WCAG {r.criteria.join(", ")} (level {r.level})
        {h && <> · found on <strong>{h.prevalence}</strong> of home pages</>}
      </p>

      <h2>Where the problem lives in {label}</h2>
      <p>{note}</p>

      <h2>What the rule requires</h2>
      <p>{g.theRule}</p>

      <h2>The general fix</h2>
      <ol>{g.howToFix.map((s, i) => <li key={i} style={{ marginBottom: ".6em" }}>{s}</li>)}</ol>

      <p className="caveat"><strong>What a scan cannot tell you</strong>{g.gotcha}</p>

      <p style={{ marginTop: 36 }}>
        <a href="/">← Scan your {label} site</a> · <a href={`/fix/${r.id}`}>All fixes for {r.id}</a>
      </p>
    </>
  )
}

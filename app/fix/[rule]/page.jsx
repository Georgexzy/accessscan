import { notFound } from "next/navigation"
import { rules, ruleById, HEADLINE, ownFinding } from "../../../lib/rules.js"
import { guideFor } from "../../../content/guides.js"
import { PLATFORM_LABEL } from "../../../lib/platforms.js"

export function generateStaticParams() {
  return rules.map((r) => ({ rule: r.id }))
}

export async function generateMetadata({ params }) {
  const { rule } = await params
  const r = ruleById(rule)
  if (!r) return {}
  const h = HEADLINE[r.id]
  return {
    title: `${r.help} — WCAG ${r.criteria[0] || ""} (level ${r.level})`,
    description: h
      ? `${r.description}. Found on ${h.prevalence} of home pages — the #${h.rank} most common accessibility failure on the web. What it is, why it matters, and how to fix it.`
      : `${r.description}. WCAG ${r.criteria.join(", ")} level ${r.level}: what the rule requires and how to satisfy it.`,
  }
}

export default async function RulePage({ params }) {
  const { rule } = await params
  const r = ruleById(rule)
  if (!r) notFound()
  const h = HEADLINE[r.id]
  const g = guideFor(r.id)
  const own = ownFinding(r.id)
  const platforms = g ? Object.keys(g.platforms || {}) : []

  return (
    <>
      {h && <p className="badge">#{h.rank} most common failure on the web</p>}
      {!h && own && <p className="badge">Failed by {own.prevalence} of sites we scanned</p>}
      <h1>{r.help}</h1>
      <p className="lede">{r.description}.</p>

      <table>
        <tbody>
          <tr><th scope="row">Rule</th><td><code>{r.id}</code></td></tr>
          <tr><th scope="row">WCAG criteria</th><td>{r.criteria.join(", ") || "—"}</td></tr>
          <tr><th scope="row">Level</th><td>{r.level || "—"}</td></tr>
          {h && <tr><th scope="row">Home pages affected</th><td><strong>{h.prevalence}</strong> — WebAIM Million, Feb 2026</td></tr>}
          {!h && own && <tr><th scope="row">Sites we found failing</th><td><strong>{own.prevalence}</strong> — <a href="/study">our scan of 38 organisations</a></td></tr>}
          <tr><th scope="row">New in WCAG 2.2</th><td>{r.wcag22 ? "Yes" : "No"}</td></tr>
        </tbody>
      </table>

      {g ? (
        <>
          {own && (
            <>
              <h2>Why this one is easy to miss</h2>
              <p>{own.note}</p>
              <p><a href="/study">See the data →</a></p>
            </>
          )}
          <h2>What it looks like</h2>
          <p>{g.whatItLooksLike}</p>

          <h2>Why it matters</h2>
          <p>{g.whyItMatters}</p>

          <h2>What the rule actually requires</h2>
          <p>{g.theRule}</p>

          <h2>How to fix it</h2>
          <ol>{g.howToFix.map((step, i) => <li key={i} style={{ marginBottom: ".6em" }}>{step}</li>)}</ol>

          <p className="caveat">
            <strong>What a scan cannot tell you</strong>
            {g.gotcha}
          </p>

          {platforms.length > 0 && (
            <>
              <h2>Fixing it on your platform</h2>
              <ul className="plain">
                {platforms.map((p) => (
                  <li key={p}>
                    <a href={`/fix/${r.id}/${p}`}>
                      <strong>{r.help} — {PLATFORM_LABEL[p] || p}</strong>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          <h2>Can a scanner prove you have fixed it?</h2>
          <p>
            Partly. An automated check confirms the machine-decidable half — that
            the attribute exists, that the ratio computes, that the element has a
            name. It cannot confirm the half that needs judgement: whether that
            name describes what the control does, or whether what a sighted user
            reads matches what a screen reader announces. Treat a pass as “no
            longer failing automatically”, which is real and worth having, and
            not as conformance.
          </p>
          <h2>The authoritative description</h2>
          <p>
            Deque maintains this rule and its canonical write-up, including the
            exact conditions checked and the accepted remediations.
          </p>
        </>
      )}

      <p><a href={r.help_url}>Deque documentation for <code>{r.id}</code> →</a></p>
      <p style={{ marginTop: 40 }}><a href="/">← Scan a page for this and 69 other checks</a></p>
    </>
  )
}

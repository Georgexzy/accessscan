import { notFound } from "next/navigation"
import { rules, ruleById, HEADLINE } from "../../../lib/rules.js"

// Fully static: 70 pages, all known at build time, no database behind them.
export function generateStaticParams() {
  return rules.map((r) => ({ rule: r.id }))
}

export function generateMetadata({ params }) {
  const r = ruleById(params.rule)
  if (!r) return {}
  const h = HEADLINE[r.id]
  return {
    title: `${r.help} — WCAG ${r.criteria[0] || ""} (${r.level})`,
    description: h
      ? `${r.description}. Found on ${h.prevalence} of home pages — the #${h.rank} most common accessibility failure on the web. What it means and how to fix it.`
      : `${r.description}. WCAG ${r.criteria.join(", ")} level ${r.level}: what the rule requires and how to satisfy it.`,
  }
}

export default function RulePage({ params }) {
  const r = ruleById(params.rule)
  if (!r) notFound()
  const h = HEADLINE[r.id]

  return (
    <>
      {h && <p className="badge">#{h.rank} most common failure on the web</p>}
      <h1>{r.help}</h1>
      <p className="lede">{r.description}.</p>

      <table>
        <tbody>
          <tr><th scope="row">Rule</th><td><code>{r.id}</code></td></tr>
          <tr><th scope="row">WCAG criteria</th><td>{r.criteria.join(", ") || "—"}</td></tr>
          <tr><th scope="row">Conformance level</th><td>{r.level || "—"}</td></tr>
          {h && <tr><th scope="row">Home pages affected</th><td><strong>{h.prevalence}</strong> (WebAIM Million, Feb 2026)</td></tr>}
          <tr><th scope="row">New in WCAG 2.2</th><td>{r.wcag22 ? "Yes" : "No"}</td></tr>
        </tbody>
      </table>

      {h && (
        <>
          <h2>Why this one matters more than the others</h2>
          <p>
            WebAIM tested a million home pages in February 2026. This failure
            appeared on <strong>{h.prevalence}</strong> of them, making it the
            number {h.rank} most common accessibility barrier on the web. Six
            problems — this among them — account for 96% of every error detected.
          </p>
        </>
      )}

      <h2>Can a scanner prove you have fixed it?</h2>
      <p>
        For this rule, partly. An automated check confirms the machine-detectable
        half: that the attribute exists, that the contrast ratio computes, that
        the element has a name. It cannot confirm the half that requires
        judgement — whether that name describes what the control actually does,
        or whether the text a sighted user reads matches what a screen reader
        announces. Treat a pass here as “no longer failing automatically”, which
        is a real and worthwhile thing, and not as conformance.
      </p>

      <h2>The authoritative description</h2>
      <p>
        Deque maintains the rule implementation and the canonical write-up,
        including the exact conditions checked and the accepted remediations.
      </p>
      <p><a href={r.help_url}>Read the axe-core documentation for <code>{r.id}</code> →</a></p>

      <p style={{ marginTop: 40 }}>
        <a href="/">← Scan a page for this and 69 other checks</a>
      </p>
    </>
  )
}

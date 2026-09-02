import { rules, HEADLINE } from "../../lib/rules.js"

export const metadata = {
  title: "WCAG fix guides",
  description:
    "How to fix every WCAG 2.2 A and AA failure an automated scan can detect — " +
    "70 rules, what each one means, and what it takes to satisfy it.",
}

export default function FixIndex() {
  const headline = rules.filter((r) => HEADLINE[r.id])
    .sort((a, b) => HEADLINE[a.id].rank - HEADLINE[b.id].rank)
  const rest = rules.filter((r) => !HEADLINE[r.id])

  return (
    <>
      <h1>WCAG fix guides</h1>
      <p className="lede">
        Every WCAG 2.2 A/AA failure an automated scan can detect: {rules.length} rules
        across 24 success criteria.
      </p>

      <h2>The six that account for 96% of errors</h2>
      <ul className="plain">
        {headline.map((r) => (
          <li key={r.id}>
            <a href={`/fix/${r.id}`}><strong>{r.help}</strong></a>{" "}
            <span className="badge">{HEADLINE[r.id].prevalence} of sites</span>
            <div style={{ color: "var(--faint)", fontSize: 14 }}>
              <code>{r.id}</code> · WCAG {r.criteria.join(", ")} level {r.level}
            </div>
          </li>
        ))}
      </ul>

      <h2>Everything else ({rest.length})</h2>
      <ul className="plain">
        {rest.map((r) => (
          <li key={r.id}>
            <a href={`/fix/${r.id}`}>{r.help}</a>
            <div style={{ color: "var(--faint)", fontSize: 14 }}>
              <code>{r.id}</code> · WCAG {r.criteria.join(", ")} level {r.level}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

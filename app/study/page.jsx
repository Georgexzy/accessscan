import study from "../../data/study.json" with { type: "json" }
import { ruleById } from "../../lib/rules.js"

const TARGET_SIZE = study.rules.find((r) => r.id === "target-size")

// Built from the data file, not typed. Rerunning the scan changes these
// numbers, and a title that disagrees with the table under it is exactly the
// sloppiness this whole project is selling the absence of.
export const metadata = {
  title: `What actually fails: WCAG 2.2 across ${study.sites_scanned} major UK and global sites`,
  description:
    `We scanned ${study.sites_scanned} large organisations — government, NHS, universities, ` +
    `retailers, and accessibility vendors themselves — against WCAG 2.2 A/AA. ` +
    `${study.pct_with_failures}% had at least one detected failure, and a WCAG 2.2 criterion ` +
    `missing from the best-known dataset failed on ${TARGET_SIZE?.pct}% of them.`,
}

const TOP = study.rules.slice(0, 12)

export default function Study() {
  return (
    <>
      <h1>What actually fails, on sites that should know better</h1>
      <p className="lede">
        We scanned {study.sites_scanned} large organisations against WCAG 2.2 A
        and AA — UK government, the NHS, universities, national charities,
        major retailers, developer platforms, and the accessibility vendors
        themselves. {study.pct_with_failures}% had at least one
        machine-detectable failure.
      </p>

      <p className="caveat">
        <strong>Read the sample before you read the number</strong>
        These are among the best-resourced websites in the country. Several are
        run by accessibility specialists whose business is this. That is exactly
        why the figure is lower than the {""}
        <a href="https://webaim.org/projects/million/">WebAIM Million</a>&apos;s
        95.9% across a million ordinary home pages — and why the failures that
        survive here are the interesting ones. This is not a random sample and
        it is not comparable to WebAIM&apos;s. {study.sites_scanned} sites is a
        small number; treat single-digit percentages as indicative, not precise.
      </p>

      <h2>The finding worth your attention</h2>
      <p>
        <strong><code>target-size</code> — WCAG 2.5.8, added in WCAG 2.2 —
        failed on {TARGET_SIZE?.pct}% of these sites.</strong> It does not appear in WebAIM&apos;s famous six,
        because their methodology centres on WCAG 2.0 and 2.1. It requires
        pointer targets to be at least 24×24 CSS pixels, or spaced far enough
        apart to compensate — and it is failed by small icon buttons, tight
        footer links and dense navigation, which is to say by the design
        conventions of the last decade.
      </p>
      <p>
        This matters commercially rather than academically: the European
        Accessibility Act references WCAG 2.2, so this is a criterion with legal
        weight that the best-known dataset in the field does not measure. If you
        have audited against 2.1 and stopped, this is the gap.
      </p>

      <h2>Every rule that failed</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Rule</th><th scope="col">Sites</th>
            <th scope="col">%</th><th scope="col">Elements</th>
          </tr>
        </thead>
        <tbody>
          {TOP.map((r) => {
            const meta = ruleById(r.id)
            return (
              <tr key={r.id}>
                <td>
                  <a href={`/fix/${r.id}`}><code>{r.id}</code></a>
                  {meta && <div style={{ color: "var(--faint)", fontSize: 13 }}>{meta.help}</div>}
                </td>
                <td>{r.sites}</td>
                <td><strong>{r.pct}%</strong></td>
                <td>{r.elements}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p style={{ fontSize: 14, color: "var(--faint)" }}>
        “Elements” is the total across all sites, so one badly-built page can
        dominate a row — {study.rules[0]?.elements} contrast failures came
        largely from a handful of sites. Sites is the more honest column.
      </p>

      <h2>Method</h2>
      <ul>
        <li>{study.sites_scanned} home pages, one request each, identified user agent.</li>
        <li>{study.engine}. Level AAA excluded — it is not the legal standard anywhere.</li>
        <li>Median rules failed per site: <strong>{study.median_rules_failed_per_site}</strong>. Mean elements affected: <strong>{study.mean_elements_affected_per_site}</strong>.</li>
        <li>{study.sites_with_zero_detected_failures} sites had zero detected failures.</li>
        <li>Home pages only. A clean home page says nothing about a checkout flow.</li>
      </ul>

      <p className="caveat">
        <strong>We are not publishing which site failed what</strong>
        69% of US web accessibility lawsuits target retailers under $25M in
        revenue. A searchable list of named organisations and their failures is
        a targeting list for that, and it would rank well. The aggregate is the
        finding; the names are nobody&apos;s business.
      </p>

      <p className="caveat">
        <strong>And this only counts what a machine can decide</strong>
        Automated testing finds roughly a quarter to a third of real WCAG
        failures. Every site above that scanned clean may still be unusable with
        a screen reader. “Zero detected failures” is a statement about our
        scanner, not about those sites.
      </p>

      <p style={{ marginTop: 36 }}>
        <a href="/">← Scan your own site</a> · <a href="/fix">All {study.rules.length > 0 ? "70" : ""} rule guides</a>
      </p>
    </>
  )
}

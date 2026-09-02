/**
 * Scan a sample of real sites and aggregate what actually fails.
 *
 * Two purposes. First, evidence for which rules deserve written guidance —
 * writing depth for a rule nobody trips is wasted, and guessing is how filler
 * gets made. Second, the aggregate is itself worth publishing: original data is
 * the one thing on a new site that other people link to.
 *
 * AGGREGATE ONLY. Per-site results are never published. 69% of US web
 * accessibility lawsuits target retailers under $25M revenue, and an indexed
 * list of named sites failing accessibility is a targeting list for that. The
 * counts are the finding; the names are somebody else's problem to be handed to
 * a plaintiff's lawyer, and we are not doing it.
 *
 * One request per site, identified user agent, sequential. This is what a
 * search engine does continuously and what WebAIM does to a million homepages.
 */
import { scan } from "./scan.js"
import { writeFileSync } from "node:fs"

const SITES = process.argv.slice(2)
if (!SITES.length) { console.error("usage: node study.js <url>..."); process.exit(2) }

const ruleCounts = new Map()   // rule -> sites affected
const elementCounts = new Map() // rule -> total elements
const impacts = new Map()
let scanned = 0, failed = 0, clean = 0
let totalElements = 0
const perSiteRuleTotals = []

for (const url of SITES) {
  try {
    const r = await scan(url, { timeoutMs: 25000 })
    scanned++
    const n = r.totals.rules_violated
    perSiteRuleTotals.push(n)
    totalElements += r.totals.elements_affected
    if (n === 0) clean++
    for (const v of r.violations) {
      ruleCounts.set(v.id, (ruleCounts.get(v.id) || 0) + 1)
      elementCounts.set(v.id, (elementCounts.get(v.id) || 0) + v.element_count)
      impacts.set(v.id, v.impact)
    }
    process.stderr.write(`  ${String(scanned).padStart(3)}. ${n === 0 ? "clean" : n + " rules"}  ${r.final_url.slice(0, 48)}\n`)
  } catch (e) {
    failed++
    process.stderr.write(`  ---. FAILED  ${url.slice(0, 48)} — ${String(e?.message || e).slice(0, 50)}\n`)
  }
}

const rows = [...ruleCounts.entries()]
  .map(([id, sites]) => ({
    id, impact: impacts.get(id), sites,
    pct: +((sites / scanned) * 100).toFixed(1),
    elements: elementCounts.get(id),
  }))
  .sort((a, b) => b.sites - a.sites)

const sorted = [...perSiteRuleTotals].sort((a, b) => a - b)
const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0

const out = {
  generated: new Date().toISOString(),
  engine: "axe-core 4.13, WCAG 2.2 A/AA",
  sites_attempted: SITES.length,
  sites_scanned: scanned,
  sites_failed_to_load: failed,
  sites_with_zero_detected_failures: clean,
  pct_with_failures: scanned ? +(((scanned - clean) / scanned) * 100).toFixed(1) : 0,
  median_rules_failed_per_site: median,
  mean_elements_affected_per_site: scanned ? +(totalElements / scanned).toFixed(1) : 0,
  rules: rows,
}
writeFileSync("data/study.json", JSON.stringify(out, null, 2))

console.log(`\nscanned ${scanned} sites (${failed} unreachable)`)
console.log(`${out.pct_with_failures}% had at least one detected failure`)
console.log(`median rules failed per site: ${median}; mean elements affected: ${out.mean_elements_affected_per_site}\n`)
console.log("rule".padEnd(26) + "sites".padStart(6) + "  %".padStart(6) + "elements".padStart(10))
for (const r of rows.slice(0, 18))
  console.log(r.id.padEnd(26) + String(r.sites).padStart(6) + String(r.pct).padStart(7) + String(r.elements).padStart(10))

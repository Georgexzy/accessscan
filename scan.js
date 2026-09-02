/**
 * First-pass WCAG scan of one page, and an honest account of what it missed.
 * ==========================================================================
 *
 * The whole product rests on one distinction that the market leader was fined
 * $1,000,000 for blurring: an automated scan finds SOME accessibility failures.
 * It does not establish compliance, and it cannot. In January 2025 the FTC
 * ordered accessiBe to pay $1m for claiming its automated product could make
 * any website WCAG-conformant; the final order (April 2025) bars that claim
 * outright absent evidence. Independent comparisons put automated detection at
 * roughly 25-40% of real WCAG violations.
 *
 * So this module is built to make overclaiming HARD:
 *
 *   - it never emits a "compliant", "pass" or "score out of 100" verdict
 *   - it reports `incomplete` (axe found something it cannot decide) as a
 *     first-class result next to `violations`, not swallowed into a pass
 *   - every result carries `coverage`, which states the limit in the payload
 *     itself, so a template that renders the number cannot quietly drop the
 *     caveat that belongs with it
 *
 * That last point is the design decision worth defending. A caveat that lives
 * in the marketing copy gets edited away by whoever writes the landing page. A
 * caveat that arrives inside the same JSON as the finding has to be actively
 * deleted, and its absence is visible in a diff.
 */

import { chromium } from "playwright"
// axe-core is CommonJS; its `source` (the whole library as a string, for
// injection into the page) is only reachable through the default export.
import axeCore from "axe-core"
const axeSource = axeCore.source
// axe reports its own version. Reading it out of package.json instead meant a
// filesystem path resolved relative to this module, which survives `node
// scan.js` and does not survive being bundled into a Next route.
const AXE_VERSION = axeCore.version

// A/AA only. AAA is not the legal standard anywhere we would sell, and mixing
// it in inflates the count with findings nobody is obliged to fix — which is
// the same dishonesty as overclaiming, pointed the other way.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

// Stated in every payload. See the header.
const COVERAGE = {
  automated_detection_rate: "roughly 25-40% of WCAG failures",
  detail:
    "Automated testing finds only failures a machine can decide. It cannot " +
    "judge whether alt text is meaningful, whether reading order makes sense, " +
    "whether a caption matches the audio, or whether a page is usable with a " +
    "screen reader. A clean scan is not compliance and this tool never says " +
    "it is.",
  not_a_compliance_certificate: true,
}

export async function scan(url, { timeoutMs = 30000 } = {}) {
  const started = Date.now()
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  })
  try {
    const context = await browser.newContext({
      // Inject axe past the page's Content-Security-Policy.
      //
      // Not optional. A strict script-src is exactly what a well-run
      // government or enterprise site ships — gov.uk refuses the injected
      // script outright — so without this the scanner fails on precisely the
      // organisations that have a legal duty to be accessible and a budget to
      // pay for help. It relaxes CSP inside this throwaway browser context
      // only; nothing about the scanned site is altered.
      bypassCSP: true,
      // Identify honestly. A scanner that hides what it is cannot complain
      // when it is blocked, and a site owner reading their logs deserves to
      // know who looked and why.
      userAgent:
        "Mozilla/5.0 (compatible; AccessScanBot/0.1; +https://example.invalid/bot)",
      viewport: { width: 1280, height: 1024 },
    })
    const page = await context.newPage()

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: timeoutMs,
    })

    // Give client-rendered pages a chance to paint. Bounded, and a timeout
    // here is not an error: plenty of real sites never go fully idle, and
    // scanning what HAS rendered beats refusing to scan at all.
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {})

    await page.addScriptTag({ content: axeSource })
    const results = await page.evaluate(async (tags) => {
      // eslint-disable-next-line no-undef
      return await axe.run(document, {
        runOnly: { type: "tag", values: tags },
        resultTypes: ["violations", "incomplete"],
      })
    }, WCAG_TAGS)

    const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    for (const v of results.violations) {
      const n = v.nodes?.length || 0
      if (v.impact && byImpact[v.impact] !== undefined) byImpact[v.impact] += n
    }

    return {
      url,
      final_url: page.url(),
      http_status: response?.status() ?? null,
      scanned_at: new Date().toISOString(),
      duration_ms: Date.now() - started,
      engine: { axe_core: AXE_VERSION, tags: WCAG_TAGS },
      coverage: COVERAGE,
      totals: {
        // Distinct rules broken, and the number of places each breaks. Both,
        // because "12 issues" and "312 elements" describe the same page and a
        // reader told only one of them has been given a misleading size.
        rules_violated: results.violations.length,
        elements_affected: Object.values(byImpact).reduce((a, b) => a + b, 0),
        needs_human_review: results.incomplete.length,
        by_impact: byImpact,
      },
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        description: v.description,
        help_url: v.helpUrl,
        wcag: (v.tags || []).filter((t) => t.startsWith("wcag")),
        element_count: v.nodes?.length || 0,
        sample_targets: (v.nodes || []).slice(0, 3).map((n) => n.target?.join(" ")),
      })),
      // Surfaced, never hidden. These are the cases axe explicitly declined to
      // decide, and folding them into "passed" is how a scan starts lying.
      needs_review: results.incomplete.map((v) => ({
        id: v.id,
        help: v.help,
        help_url: v.helpUrl,
        element_count: v.nodes?.length || 0,
      })),
    }
  } finally {
    await browser.close()
  }
}

// CLI: node scan.js https://example.com
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2]
  if (!url) {
    console.error("usage: node scan.js <url>")
    process.exit(2)
  }
  scan(url)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(JSON.stringify({ url, error: String(e?.message || e) }, null, 2))
      process.exit(1)
    })
}

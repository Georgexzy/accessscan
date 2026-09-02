#!/usr/bin/env node
/**
 * accessscan — run the WCAG checks against one or more URLs from a terminal
 * or a CI job, and decide whether to fail the build.
 *
 * The threshold is the interesting design decision. A tool that fails CI on
 * "any finding at all" gets switched off in a fortnight, because every real
 * codebase has a backlog and a gate that is always red is not a gate. So the
 * default fails on `serious` and above — the band that maps to a user actually
 * being blocked — and the rest is reported without stopping the build. Teams
 * that want the strict version can ask for it; teams that would otherwise
 * delete the workflow get something they will keep.
 *
 * `needs_review` NEVER fails a build. Those are the cases axe declined to
 * decide, and failing on them would be asking a human to fix an uncertainty.
 * They are printed, because hiding them is the lie this whole project exists
 * to avoid.
 */
import { scan } from "./scan.js"

const ORDER = ["minor", "moderate", "serious", "critical"]
const args = process.argv.slice(2)

function flag(name, fallback = null) {
  const i = args.indexOf(`--${name}`)
  if (i === -1) return fallback
  const v = args[i + 1]
  return v && !v.startsWith("--") ? v : true
}

const urls = args.filter((a) => !a.startsWith("--") && !/^(critical|serious|moderate|minor|none|any)$/.test(a))
const failOn = String(flag("fail-on", "serious")).toLowerCase()
const asJson = !!flag("json", false)
const ghAnnotations = !!flag("github", false) || !!process.env.GITHUB_ACTIONS

if (!urls.length || flag("help")) {
  console.log(`
accessscan — first-pass WCAG 2.2 A/AA checks

  npx accessscan <url> [url...] [options]

  --fail-on <level>   critical | serious | moderate | minor | any | none
                      (default: serious — see the note in cli.js)
  --json              machine-readable output
  --github            emit GitHub Actions annotations
  --help

Exit codes: 0 clean or under threshold · 1 over threshold · 2 usage · 3 scan failed

This finds roughly a quarter to a third of WCAG failures. It cannot tell you
that a site is accessible or compliant, and it never claims to.
`)
  process.exit(urls.length ? 0 : 2)
}

const threshold = ORDER.indexOf(failOn)
if (failOn !== "any" && failOn !== "none" && threshold === -1) {
  console.error(`unknown --fail-on level: ${failOn}`)
  process.exit(2)
}

const results = []
let hardFailures = 0
let scanErrors = 0

for (const url of urls) {
  try {
    const r = await scan(url)
    results.push(r)

    if (failOn !== "none") {
      for (const v of r.violations) {
        const rank = ORDER.indexOf(v.impact)
        const counts = failOn === "any" ? true : rank >= threshold
        if (counts) hardFailures += 1
      }
    }

    if (!asJson) {
      const t = r.totals
      console.log(`\n${r.final_url}  —  HTTP ${r.http_status}, ${r.duration_ms}ms`)
      if (!t.rules_violated) {
        console.log("  no automatic failures detected")
      } else {
        for (const v of r.violations) {
          console.log(`  [${(v.impact || "?").padEnd(8)}] ${v.id} × ${v.element_count}  ${v.help}`)
          if (ghAnnotations) {
            const lvl = ORDER.indexOf(v.impact) >= threshold ? "error" : "warning"
            console.log(`::${lvl} title=${v.id}::${v.help} — ${v.element_count} element(s) on ${r.final_url}. ${v.help_url}`)
          }
        }
      }
      if (t.needs_human_review) {
        console.log(`  ${t.needs_human_review} item(s) need a human decision (never fails the build)`)
      }
    }
  } catch (e) {
    scanErrors += 1
    console.error(`\n${url} — scan failed: ${String(e?.message || e).slice(0, 200)}`)
  }
}

if (asJson) console.log(JSON.stringify({ results }, null, 2))

if (!asJson) {
  console.log(
    `\n${results.length} page(s) scanned. ` +
      `${hardFailures} finding(s) at or above "${failOn}".`,
  )
  console.log(
    "Automated testing finds roughly 25-40% of WCAG failures. A clean run is " +
      "not conformance.",
  )
}

if (scanErrors && !results.length) process.exit(3)
process.exit(hardFailures > 0 ? 1 : 0)

/**
 * Extract the axe-core rule catalogue into our own dataset.
 *
 * Every programmatic page on this site is backed by a row from here. That is
 * the difference between a page worth indexing and scaled-content spam: the
 * rule id, the success criterion it maps to, and the impact are FACTS carried
 * out of the engine that will actually test the reader's site, not adjectives
 * generated to fill a template.
 *
 * What this deliberately does NOT do is invent per-platform advice for all
 * 70 rules x N platforms. That product exists and it is called filler. Platform
 * guidance is authored per rule in content/, and a page is only generated where
 * real guidance exists — see gen-pages.js.
 */
import axe from "axe-core"
import { writeFileSync } from "node:fs"

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

// wcag143 -> "1.4.3". The tag is the criterion number with the dots removed,
// and the first digit is always the principle, so the split is positional.
const criterionFromTag = (t) => {
  const d = t.replace(/^wcag/, "")
  return d.length >= 3 ? `${d[0]}.${d[1]}.${d.slice(2)}` : null
}

const LEVEL = { wcag2a: "A", wcag21a: "A", wcag2aa: "AA", wcag21aa: "AA", wcag22aa: "AA" }

const rules = axe.getRules(WCAG_TAGS).map((r) => {
  const tags = r.tags || []
  const scTags = tags.filter((t) => /^wcag\d{3,4}$/.test(t))
  const levelTag = tags.find((t) => LEVEL[t])
  return {
    id: r.ruleId,
    slug: r.ruleId,
    help: r.help,
    description: r.description,
    help_url: r.helpUrl,
    // A rule can map to more than one criterion; keep them all.
    criteria: scTags.map(criterionFromTag).filter(Boolean),
    level: levelTag ? LEVEL[levelTag] : null,
    wcag22: tags.includes("wcag22aa"),
    tags,
  }
})

rules.sort((a, b) => a.id.localeCompare(b.id))
writeFileSync("data/rules.json", JSON.stringify(rules, null, 2))

const byCriterion = {}
for (const r of rules) for (const c of r.criteria) (byCriterion[c] ||= []).push(r.id)

console.log(`rules written      : ${rules.length}`)
console.log(`success criteria   : ${Object.keys(byCriterion).length}`)
console.log(`WCAG 2.2-only rules: ${rules.filter((r) => r.wcag22).length}`)
console.log(`rules with no criterion mapping: ${rules.filter((r) => !r.criteria.length).length}`)

import rulesData from "../data/rules.json" with { type: "json" }

/**
 * The six failure types WebAIM found account for 96% of all detected errors
 * across 1,000,000 home pages (Feb 2026). Traffic and commercial intent are
 * concentrated here, so these rules get authored platform guidance and the
 * other 62 get an honest reference page. That split is the whole content
 * strategy: depth where it is read, accuracy everywhere.
 */
export const HEADLINE = {
  "color-contrast": { rank: 1, prevalence: "83.9%", label: "Low contrast text" },
  "image-alt":      { rank: 2, prevalence: "53.1%", label: "Missing alternative text" },
  "label":          { rank: 3, prevalence: "51.0%", label: "Missing form input labels" },
  "link-name":      { rank: 4, prevalence: "46.3%", label: "Empty links" },
  "button-name":    { rank: 5, prevalence: "30.6%", label: "Empty buttons" },
  "html-has-lang":  { rank: 6, prevalence: "13.5%", label: "Missing document language" },
}

export const rules = rulesData
export const ruleById = (id) => rulesData.find((r) => r.id === id) || null
export const headlineRules = () =>
  Object.keys(HEADLINE)
    .map(ruleById)
    .filter(Boolean)
    .sort((a, b) => HEADLINE[a.id].rank - HEADLINE[b.id].rank)

/**
 * Rules we have our own evidence for, from our own scan of 38 large
 * organisations. Separate from HEADLINE because the provenance is different and
 * conflating them would launder our 38-site sample into WebAIM's million.
 */
export const OWN_FINDING = {
  "target-size": {
    prevalence: "10.5%",
    note:
      "WCAG 2.5.8, added in WCAG 2.2 and therefore absent from WebAIM's six, " +
      "which centre on 2.0 and 2.1. We found it failing on 10.5% of 38 large " +
      "UK and global organisations — including several whose business is " +
      "accessibility. WCAG 2.2 is the version the European Accessibility Act " +
      "references, so this is a criterion with legal weight that the " +
      "best-known dataset in the field does not measure.",
  },
}
export const ownFinding = (id) => OWN_FINDING[id] || null

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
 * Rules we have our own evidence for, from our own scan of large organisations.
 *
 * Deliberately separate from HEADLINE: that comes from a million pages and this
 * from tens, and merging them would launder our sample into WebAIM's.
 *
 * No percentage is written here. The first run of 38 sites put target-size at
 * 10.5%; widening to 64 put it at 7.8%. A figure typed into prose is a
 * figure that goes stale on the next run and quietly keeps whichever number
 * flattered us most, so the pages read it from data/study.json instead.
 */
export const OWN_FINDING = {
  "target-size": {
    note:
      "WCAG 2.5.8, added in WCAG 2.2 and therefore absent from WebAIM's six, " +
      "which centre on 2.0 and 2.1. WCAG 2.2 is the version the European " +
      "Accessibility Act references, so this is a criterion with legal weight " +
      "that the best-known dataset in the field does not measure — and a team " +
      "that audited to 2.1 and stopped has the gap without knowing it.",
  },
}
export const ownFinding = (id) => OWN_FINDING[id] || null

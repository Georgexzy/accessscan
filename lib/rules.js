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

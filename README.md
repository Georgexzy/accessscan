# AccessScan

**A WCAG 2.2 scanner that tells you what it could not check.**

```bash
npx accessscan https://your-site.com
```

> **Not on npm yet.** Until it is published, run it from a clone:
> ```bash
> git clone https://github.com/Georgexzy/accessscan && cd accessscan
> npm install
> node cli.js https://your-site.com
> ```
> The GitHub Action below works today and needs none of this.

```
https://news.ycombinator.com/  —  HTTP 200, 2153ms
  [serious ] color-contrast × 238  Elements must meet minimum color contrast ratio thresholds
  [critical] image-alt × 3         Images must have alternative text
  [critical] label × 1             Form elements must have labels
  [serious ] link-name × 1         Links must have discernible text
  [serious ] target-size × 29      All touch targets must be 24px large
  1 item(s) need a human decision (never fails the build)

1 page(s) scanned. 5 finding(s) at or above "serious".
Automated testing finds roughly 25-40% of WCAG failures. A clean run is not conformance.
```

---

## The one rule

**This never tells you a site is compliant, because it cannot know.**

Automated testing catches somewhere around a quarter to a third of real WCAG
failures. It cannot judge whether alt text is *meaningful*, whether reading
order makes *sense*, whether a caption matches the audio, or whether a page
actually works with a screen reader. Those need a person.

That limit is not a disclaimer bolted onto the marketing. It is enforced in the
data:

- every result carries a `coverage` object stating the limit, in the same JSON
  as the findings
- `incomplete` results — the cases axe-core explicitly *declined to decide* —
  come back as a first-class `needs_review` list, never folded into a pass
- `needs_review` never fails a build, because failing on an uncertainty asks a
  human to fix a question rather than a defect

A caveat in the copy gets edited away by whoever writes the landing page. A
caveat inside the payload has to be deleted on purpose, and shows up in a diff.

### Why anyone should care about that

In January 2025 the FTC ordered **accessiBe to pay $1,000,000** for claiming its
automated product could make any website WCAG-conformant. It could not — it
failed on navigation menus, form fields and image descriptions — and the final
order now bars the claim outright absent evidence. Over 800 businesses running
it were sued anyway.

- [FTC, January 2025](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites)
- [Final order, April 2025](https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million)

## Usage

```bash
node cli.js <url> [url...] [options]      # from a clone
npx accessscan <url> [url...] [options]   # once published to npm

  --fail-on <level>   critical | serious | moderate | minor | any | none
                      default: serious
  --json              machine-readable output
  --github            GitHub Actions annotations
```

Exit codes: `0` under threshold · `1` over · `2` usage · `3` scan failed.

### In CI

```yaml
- uses: Georgexzy/accessscan@v1
  with:
    urls: |
      https://example.com
      https://example.com/pricing
    fail-on: serious
```

**The default threshold is `serious`, not `any`, on purpose.** Every real
codebase has an accessibility backlog, and a gate that is always red is not a
gate — it is a workflow somebody deletes in a fortnight. Failing on the band
where a user is actually blocked, and reporting the rest without stopping the
build, is the version a team keeps. `--fail-on any` is there if you want it.

## What it found, on real sites

Validated against sites that should pass and one that should not:

| Site | Result |
|---|---|
| `w3.org/WAI` — the accessibility standards body | clean |
| `gov.uk` | clean |
| `bbc.co.uk` | clean |
| `news.ycombinator.com` | 5 rules over 272 elements |

No false positives on the standards body's own site. And on the author's own
site it found **11,352 failing elements** across 12 page types — including a
hardcoded hex that silently overrode the design token meant to fix it, and a
sepia reading theme at 3.13:1 that **no scanner would ever find**, because a
scanner renders one theme and that was not it. Which is rather the point.

## The six that matter

WebAIM tested a million home pages in February 2026. **95.9% failed**, averaging
56.1 errors — and **96% of every error was one of six problems**:

| Problem | Home pages affected |
|---|---:|
| Low contrast text | 83.9% |
| Missing alt text | 53.1% |
| Missing form labels | 51.0% |
| Empty links | 46.3% |
| Empty buttons | 30.6% |
| Missing document language | 13.5% |

Source: [The WebAIM Million](https://webaim.org/projects/million/).

## How it works

Headless Chromium via Playwright, [axe-core](https://github.com/dequelabs/axe-core)
(MPL-2.0 — the engine behind Google Lighthouse) injected into the page, WCAG 2.2
A/AA rules only. AAA is excluded: it is not the legal standard anywhere, and
including it inflates the count with findings nobody is obliged to fix, which is
the same dishonesty as overclaiming pointed the other way.

`bypassCSP` is on. A strict `script-src` is exactly what a well-run government
or enterprise site ships — gov.uk refuses the injected script outright — so
without it the scanner fails on precisely the organisations with a legal duty to
be accessible.

## Licence

MIT. axe-core is MPL-2.0 and is used unmodified.

# AccessScan

A first-pass WCAG 2.2 (A/AA) scanner that is honest about what it missed.

## The one rule

**This tool never says a site is compliant, because it cannot know.**

Automated testing catches roughly 25-40% of real WCAG failures. It cannot judge
whether alt text is *meaningful*, whether reading order makes *sense*, whether a
caption matches the audio, or whether a page actually works with a screen
reader. Those need a person.

That limit is not a disclaimer bolted onto the marketing. It is enforced in the
data: every scan payload carries a `coverage` object stating the limit, and
`incomplete` results — the cases axe-core explicitly declined to decide — are
returned as a first-class `needs_review` list rather than folded into a pass.
A caveat in the copy gets edited away by whoever writes the landing page. A
caveat inside the JSON has to be deleted on purpose, and shows up in a diff.

## Why this matters commercially

In January 2025 the FTC ordered accessiBe — the category leader — to pay
**$1,000,000** for claiming its automated product could make any website
WCAG-conformant. It could not: it failed on navigation menus, form fields and
image descriptions. The final order (April 2025) bars the claim outright absent
evidence. Over 800 businesses running accessiBe were sued anyway.

So the market is full of people who bought a promise and got sued. Refusing to
overclaim is not a handicap here. It is the product.

- FTC, Jan 2025: https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million-deceptive-claims-its-ai-product-could-make-websites
- Final order, Apr 2025: https://www.ftc.gov/news-events/news/press-releases/2025/04/ftc-approves-final-order-requiring-accessibe-pay-1-million

## What it will NOT do

It will not publish unsolicited public "this site fails" pages for scanned
domains. 69% of US ADA web lawsuits target retailers under $25M revenue; an
indexed database of small businesses failing accessibility is a targeting list
for predatory litigation. It would rank well. We are not building it.

Public report pages are opt-in, by the site's own owner, only.

## Usage

    node scan.js https://example.com

## Licensing

axe-core is MPL-2.0 (commercial and SaaS use permitted, royalty-free) — the
same engine behind Google Lighthouse. Verified against the LICENSE file
2026-09-02.

## Status

Prototype. The scan pipeline works end to end. Nothing else is built yet.

import ScanForm from "./ScanForm.jsx"
import { headlineRules, HEADLINE } from "../lib/rules.js"

export const metadata = {
  title: "Free WCAG accessibility scan — AccessScan",
  description:
    "Scan any page against WCAG 2.2 A and AA in seconds. Free, no signup. " +
    "Reports what it found and what it could not check — because no automated " +
    "tool can certify accessibility compliance.",
}

export default function Home() {
  const top = headlineRules()
  return (
    <>
      <h1>Find the accessibility failures a machine can find</h1>
      <p className="lede">
        Paste a URL. We load it in a real browser, run the same engine Google
        Lighthouse uses, and tell you what broke — and what we could not check.
      </p>

      <ScanForm />

      <p className="caveat">
        <strong>Why we will never tell you that you are compliant</strong>
        Automated testing catches roughly a quarter to a third of real WCAG
        failures. It cannot judge whether alt text is <em>meaningful</em>,
        whether reading order makes sense, or whether a page works with a screen
        reader. In January 2025 the FTC fined an accessibility vendor{" "}
        <strong>$1,000,000</strong> for claiming its automated product made sites
        compliant. It did not. Over 800 of its customers were sued anyway.
      </p>

      <h2>Six problems cause almost everything</h2>
      <p>
        WebAIM tested a million home pages in February 2026. They found failures
        on <strong>95.9%</strong> of them, averaging 56.1 errors per page — and{" "}
        <strong>96% of all those errors were just six problems</strong>. If you
        fix nothing else, fix these.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Problem</th>
            <th scope="col">Home pages affected</th>
            <th scope="col">Rule</th>
          </tr>
        </thead>
        <tbody>
          {top.map((r) => (
            <tr key={r.id}>
              <td><a href={`/fix/${r.id}`}>{HEADLINE[r.id].label}</a></td>
              <td><strong>{HEADLINE[r.id].prevalence}</strong></td>
              <td><code>{r.id}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 14, color: "var(--faint)" }}>
        Source: <a href="https://webaim.org/projects/million/">The WebAIM Million</a>,
        February 2026, 1,000,000 home pages.
      </p>
    </>
  )
}

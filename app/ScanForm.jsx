"use client"
import { useState } from "react"

const IMPACT_COLOUR = {
  critical: "var(--crit)", serious: "var(--serious)",
  moderate: "var(--moderate)", minor: "var(--faint)",
}

export default function ScanForm() {
  const [url, setUrl] = useState("")
  const [state, setState] = useState({ status: "idle" })

  async function submit(e) {
    e.preventDefault()
    if (!url.trim()) return
    setState({ status: "running" })
    try {
      const r = await fetch("/api/scan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await r.json()
      setState(r.ok ? { status: "done", data } : { status: "error", error: data.error })
    } catch (err) {
      setState({ status: "error", error: String(err?.message || err) })
    }
  }

  const d = state.data
  return (
    <>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label htmlFor="url" style={{ position: "absolute", left: -9999 }}>
          Address of the page to scan
        </label>
        <input
          id="url" type="url" inputMode="url" required value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.com"
          style={{
            flex: "1 1 260px", minWidth: 0, padding: "12px 14px", fontSize: 16,
            border: "1px solid var(--line)", borderRadius: 8,
            background: "var(--surface)", color: "var(--text)",
          }}
        />
        <button
          type="submit" disabled={state.status === "running"}
          style={{
            padding: "12px 20px", fontSize: 16, fontWeight: 600, minHeight: 44,
            border: 0, borderRadius: 8, cursor: "pointer",
            background: "var(--accent)", color: "var(--bg)",
          }}
        >
          {state.status === "running" ? "Scanning…" : "Scan"}
        </button>
      </form>

      {state.status === "running" && (
        <p style={{ color: "var(--faint)" }} role="status">
          Loading the page in a real browser and running 70 WCAG checks. Usually a second or two.
        </p>
      )}

      {state.status === "error" && (
        <p className="caveat" role="alert" style={{ borderColor: "var(--crit)" }}>
          <strong>Could not scan that</strong>{state.error}
        </p>
      )}

      {state.status === "done" && d && (
        <section style={{ marginTop: 28 }} aria-live="polite">
          <h2 style={{ marginTop: 0 }}>
            {d.totals.rules_violated === 0
              ? "No automatic failures detected"
              : `${d.totals.rules_violated} rule${d.totals.rules_violated === 1 ? "" : "s"} failing, across ${d.totals.elements_affected} element${d.totals.elements_affected === 1 ? "" : "s"}`}
          </h2>
          <p style={{ color: "var(--faint)", fontSize: 14, marginTop: -8 }}>
            {d.final_url} · HTTP {d.http_status} · {d.duration_ms} ms · axe-core {d.engine.axe_core}
          </p>

          {/* The caveat renders from the payload, not from copy. See scan.js. */}
          <p className="caveat">
            <strong>
              {d.totals.rules_violated === 0
                ? "This is not a clean bill of health"
                : "This is a first pass, not the full picture"}
            </strong>
            {d.coverage.detail}
          </p>

          {d.violations.length > 0 && (
            <table>
              <caption style={{ textAlign: "left", padding: "0 0 8px", color: "var(--faint)", fontSize: 14 }}>
                What failed
              </caption>
              <thead>
                <tr><th scope="col">Issue</th><th scope="col">WCAG</th><th scope="col">Impact</th><th scope="col">Places</th></tr>
              </thead>
              <tbody>
                {d.violations.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <a href={`/fix/${v.id}`}>{v.help}</a>
                      <div style={{ color: "var(--faint)", fontSize: 13 }}><code>{v.id}</code></div>
                    </td>
                    <td>{v.wcag.filter((t) => /^wcag\d{3,4}$/.test(t)).map((t) => t.replace(/^wcag/, "").split("").join(".").replace(/\.(\d)\.(\d)$/, ".$1$2")).join(", ") || "—"}</td>
                    <td style={{ color: IMPACT_COLOUR[v.impact] || "var(--faint)", fontWeight: 600 }}>{v.impact || "—"}</td>
                    <td>{v.element_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {d.needs_review.length > 0 && (
            <>
              <h2>Needs a human ({d.needs_review.length})</h2>
              <p style={{ color: "var(--dim)", marginTop: "-.5em" }}>
                axe found these and declined to decide. They are not passes, and
                a scanner that hid them would be flattering you.
              </p>
              <ul className="plain">
                {d.needs_review.map((r) => (
                  <li key={r.id}>
                    <a href={`/fix/${r.id}`}>{r.help}</a>{" "}
                    <span style={{ color: "var(--faint)" }}>× {r.element_count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </>
  )
}

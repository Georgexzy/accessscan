export const metadata = {
  title: { default: "AccessScan — first-pass WCAG checks, honestly reported",
           template: "%s · AccessScan" },
  description:
    "Free automated WCAG 2.2 A/AA scan. Tells you what it found and what it " +
    "could not check — because automated testing finds roughly a third of " +
    "accessibility failures, and no scanner can certify compliance.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <style>{CSS}</style>
        <header className="site">
          <a className="brand" href="/">AccessScan</a>
          <nav><a href="/study">Study</a> &nbsp; <a href="/fix">Fix guides</a></nav>
        </header>
        <main>{children}</main>
        <footer className="site">
          <p>
            AccessScan runs <a href="https://github.com/dequelabs/axe-core">axe-core</a> (MPL-2.0),
            the engine behind Google Lighthouse. It reports findings, never compliance.
          </p>
        </footer>
      </body>
    </html>
  )
}

const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --bg:#fbfaf8; --surface:#fff; --text:#171614; --dim:#4d4a45; --faint:#66625c;
  --line:rgba(23,22,20,.14); --accent:#0b5c3f; --accent-bg:#e7f2ec;
  --crit:#98150c; --serious:#96430a; --moderate:#6a5a10;
}
@media (prefers-color-scheme:dark){:root{
  --bg:#16181a; --surface:#1e2124; --text:#eceae6; --dim:#bdb9b2; --faint:#9a958d;
  --line:rgba(236,234,230,.16); --accent:#6ec49b; --accent-bg:rgba(110,196,155,.13);
  --crit:#f08a80; --serious:#e3a765; --moderate:#d4c37a;
}}
body{margin:0;background:var(--bg);color:var(--text);
  font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{max-width:760px;margin:0 auto;padding:0 20px 72px}
header.site,footer.site{max-width:760px;margin:0 auto;padding:20px}
header.site{display:flex;align-items:center;justify-content:space-between;gap:16px}
.brand{font-weight:700;font-size:18px;color:var(--text);text-decoration:none;letter-spacing:-.01em}
a{color:var(--accent)}
h1{font-size:30px;line-height:1.2;letter-spacing:-.02em;margin:.4em 0 .3em}
h2{font-size:20px;letter-spacing:-.01em;margin:2em 0 .5em}
.lede{font-size:18px;color:var(--dim);margin:0 0 1.6em}
footer.site{border-top:1px solid var(--line);margin-top:56px;color:var(--faint);font-size:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:18px}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--faint)}
code{font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
  background:var(--accent-bg);padding:1px 5px;border-radius:4px}
.badge{display:inline-block;font-size:12px;font-weight:600;padding:2px 8px;
  border-radius:999px;background:var(--accent-bg);color:var(--accent)}
.caveat{border-left:3px solid var(--accent);background:var(--accent-bg);
  padding:14px 16px;border-radius:0 8px 8px 0;font-size:15px;margin:1.5em 0}
.caveat strong{display:block;margin-bottom:.3em}
ul.plain{list-style:none;padding:0;margin:0}
ul.plain li{padding:11px 0;border-bottom:1px solid var(--line)}
@media (max-width:600px){h1{font-size:25px}main{padding:0 16px 56px}}
`

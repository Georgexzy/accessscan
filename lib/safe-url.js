import { lookup } from "node:dns/promises"
import net from "node:net"

/**
 * Decide whether a user-supplied URL may be fetched by the scanner.
 *
 * This is the security boundary of the whole product. The scanner is a browser
 * that anyone on the internet can point at a URL of their choosing, running on
 * a host that also serves other things — a FicAtlas API on :8000, a database on
 * :5432, and whatever a cloud provider exposes on 169.254.169.254. Without this
 * check, "scan my site" is a request to read internal services and hand the
 * results back to the caller, which is a textbook SSRF.
 *
 * Two rules, and the second is the one that is easy to get wrong:
 *
 *   1. Only http/https, and no credentials in the URL.
 *   2. RESOLVE THE HOSTNAME AND CHECK THE ADDRESS, not the name. Blocking the
 *      string "localhost" stops nothing: an attacker controls DNS for their own
 *      domain and can point evil.example.com at 127.0.0.1. The address the name
 *      resolves to is the only thing worth checking.
 *
 * A residual race remains — DNS could change between this check and the
 * browser's own lookup (a rebind). Closing that properly needs the fetch pinned
 * to the address checked here; it is recorded rather than pretended away.
 */

function v4Blocked(ip) {
  const p = ip.split(".").map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return true
  const n = ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]
  const cidrs = [
    ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
    ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24],
    ["192.0.2.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15],
    ["198.51.100.0", 24], ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
  ]
  for (const [base, bits] of cidrs) {
    const b = base.split(".").map(Number)
    const bn = ((b[0] << 24) >>> 0) + (b[1] << 16) + (b[2] << 8) + b[3]
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    if ((n & mask) >>> 0 === (bn & mask) >>> 0) return true
  }
  return false
}

function v6Blocked(ip) {
  const a = ip.toLowerCase()
  if (a === "::" || a === "::1") return true
  if (a.startsWith("fe80") || a.startsWith("fc") || a.startsWith("fd")) return true
  // ::ffff:127.0.0.1 — an IPv4 address wearing a v6 coat.
  const m = a.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (m) return v4Blocked(m[1])
  return false
}

export async function checkScanTarget(raw) {
  let u
  try {
    u = new URL(String(raw).trim())
  } catch {
    return { ok: false, reason: "That does not look like a URL." }
  }
  if (u.protocol !== "http:" && u.protocol !== "https:")
    return { ok: false, reason: "Only http:// and https:// addresses can be scanned." }
  if (u.username || u.password)
    return { ok: false, reason: "URLs with embedded credentials are not accepted." }

  // An IPv6 literal arrives from URL as "[::1]". Strip the brackets, or the
  // DNS lookup fails and the address is blocked for the wrong reason — which
  // is the kind of accident that stops being true after a refactor.
  const host = u.hostname.replace(/^\[|\]$/g, "")

  let addrs
  if (net.isIP(host)) {
    // Already an address: check it directly. Resolving it would be a no-op at
    // best and, for an IPv4 literal, a needless dependency on the resolver.
    addrs = [{ address: host }]
  } else {
    try {
      addrs = await lookup(host, { all: true })
    } catch {
      return { ok: false, reason: `Could not resolve ${host}.` }
    }
    if (!addrs.length) return { ok: false, reason: `Could not resolve ${host}.` }
  }

  for (const { address } of addrs) {
    const blocked = net.isIPv4(address) ? v4Blocked(address) : v6Blocked(address)
    if (blocked)
      return {
        ok: false,
        reason: "That address is on a private or reserved network, so it is not scannable here.",
      }
  }
  return { ok: true, url: u.toString(), addresses: addrs.map((a) => a.address) }
}

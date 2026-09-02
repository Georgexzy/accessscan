/** @type {import('next').NextConfig} */
export default {
  // playwright must not be traced/bundled by webpack — it needs to resolve its
  // own browser binaries at runtime from the real node_modules on disk.
  serverExternalPackages: ["playwright", "playwright-core"],
}

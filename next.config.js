/** @type {import('next').NextConfig} */
export default {
  // Required from node_modules at runtime rather than bundled.
  //
  // playwright needs it because it resolves its own browser binaries from disk.
  // axe-core needs it because what we use is `axe.source` — the entire library
  // as a 1.3MB string, injected into the scanned page. Bundled, that string did
  // not survive the production build: the injection ran, defined nothing, and
  // every scan failed with "axe is not defined" inside the container while
  // working perfectly under `next start`. A dev/prod-only failure in the one
  // code path the product exists for.
  serverExternalPackages: ["playwright", "playwright-core", "axe-core"],
}

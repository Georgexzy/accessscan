# Playwright's own image, because the alternative is chasing the ~20 shared
# libraries headless Chromium needs on a slim base and rediscovering which one
# is missing every time the browser rolls forward. The tag is pinned to the
# playwright version in package.json — they ship as a matched pair, and a
# mismatch means the browser build on disk is not the one the client expects.
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package.json package-lock.json ./
# --include=dev, and the flag is load-bearing rather than decorative.
#
# next, react and react-dom are devDependencies: they build the WEBSITE and are
# no part of the CLI that npm users install. But ENV NODE_ENV=production above
# makes npm omit devDependencies by DEFAULT, with no warning — so a plain
# `npm ci` here installed everything except the framework, and `next build`
# then failed claiming Next.js was "installed globally rather than as a project
# dependency", which is a confusing way to say it was not installed at all.
RUN npm ci --include=dev

COPY . .
RUN node build-rules.js && npx next build

# The image already carries the browsers; running as the non-root user it
# provides means the scanner is not a root process holding a browser open on
# attacker-supplied pages.
USER pwuser

EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]

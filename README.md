# Next Step Printing

Faithful migration of [nextstepprinting.com](https://nextstepprinting.com/) to static HTML with Cloudflare Pages Functions and Resend. All 15 publicly linked pages are recreated. **The owner-created Pages review copy is live; real email delivery needs configuration.** See [migration status](docs/migration-status.md) for evidence and remaining checks.

## Editing in VS Code

- `public/index.html`: home page.
- `public/about/`, `services/`, `graphic-design/`, `our-work/`, `get-a-quote/`, `contact/`: business pages; edit each folder's `index.html`.
- `public/portfolio/<original-slug>/index.html`: eight portfolio pages.
- `public/assets/styles/site.css`: independent header, controls, responsive adjustments, and form states.
- `public/assets/site.js`: menu, carousel, gallery dialog, sorting/sharing, and form behavior.
- `public/assets/images/YYYY/MM/`: original images and responsive derivatives, with original filenames.
- `public/assets/fonts/`: local Montserrat and original icon fonts.
- `public/assets/styles/*-layout.css`: original page-specific layouts. [Page inventory](docs/page-inventory.json) maps routes to styles; other captured CSS supplies original grid, typography, and components.
- `functions/api/quote.js`: server-side validation, Turnstile verification, and Resend delivery.
- `functions/api/form-config.js`: exposes only the public captcha site key when delivery is configured.

Edit `public/`, not generated `dist/`. Text, images, and links are directly editable HTML. Headers/footers are currently repeated across pages, so shared changes require updating all 15 files. Original visual class names remain for fidelity. Captured CSS is standalone: WordPress, PHP, jQuery, the original host, and theme scripts are not required. Retain third-party license notices.

Our Work uses a small masonry routine in `site.js`; its columns and animated positioning are styled in `site.css`. Original hover effects remain in the captured layout/component CSS. Small hover feedback remains enabled with reduced-motion preferences, while spatial transitions are shorter and automatic carousel movement is suppressed. Window scrolling stays native.

The image viewer has a transparent stage over a dark backdrop, circular chevrons fixed to the viewer's side rails, a top-right X, and keyboard navigation. Arrows stay at the same screen position between photos. Its style is in the `.nsp-lightbox` rules in `site.css`.

Navigation shows all seven links on one row from 1100px upward and an orange overlay with bold white text below that width. Compact-menu hover/focus draws an underline outward from the center without a background highlight. Keep the breakpoint synchronized between `site.css` and the `wideMenu` query in `site.js`. Mode changes restore the menu's scroll lock without disturbing an open image viewer. The shared copyright line ends at “All rights reserved” without a trailing period.

## Local commands

Use Node.js 22 or newer:

```sh
npm run dev
npm run check
npm test
npm run build
```

These commands need no npm dependencies/install step. Preview is `http://127.0.0.1:4173`. The static server deliberately disables email and returns 503 for APIs; the form shows an unavailable state and preserves input.

On this machine, Node and Git were missing from terminal PATH. Git is at `C:\Program Files\Git\cmd\git.exe`. Until Node is installed/on PATH, use VS Code's bundled runtime:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 dev
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 check
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 test
powershell -ExecutionPolicy Bypass -File scripts/dev.ps1 build
```

The helper changes no system settings. A verified portable Node runtime used for migration checks is in ignored `.preview/`; it is not required or committed.

The build only copies `public/` to `dist/`, keeping documentation/tests outside the hosted folder. Cloudflare compiles root `functions/` separately. No HTML generator or bundler is needed. When deleting source files, also remove their old copies from `dist/`, or build into an empty output directory.

## Cloudflare Pages settings for an authorized deployment

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Root directory | Repository root (`/`) |
| Build command | `npm run build` |
| Build output | `dist` |
| Build variable | `NODE_VERSION=22` |
| Functions | Root `functions/`, automatic Pages convention |
| Compatibility date | `2026-10-27` |
| Node compatibility flag | Not needed; Functions use web APIs |
| Function routes | `/api/*`, from `public/_routes.json` |
| Production branch | Pending owner decision after review |

The owner has connected a Pages review site. Further deployments and DNS changes require authorization; pushing a connected branch can automatically deploy. `migration-base` is an empty review base, not production. `feature/website-migration` is the working branch and was selected in the owner's Pages setup screen. Original page paths are retained; no page redirects are needed. Pages supplies normal directory/index URL handling.

References: [static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Functions development](https://developers.cloudflare.com/pages/functions/local-development/), and [bindings/secrets](https://developers.cloudflare.com/pages/functions/bindings/).

## Form setup

The original quote form has six required fields: Name, Email, Phone, City, Project Type (free text), and Project Details. **No upload field exists.** The contact page uses email links, with no separate form.

Configure separately for each approved preview/production environment:

| Variable | Storage | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Cloudflare secret | Resend sending credential |
| `QUOTE_FROM` | Server-side variable | Owner-confirmed address on a Resend-verified domain |
| `QUOTE_TO` | Server-side variable | Owner-confirmed recipient |
| `TURNSTILE_SECRET_KEY` | Cloudflare secret | Spam verification |
| `TURNSTILE_SITE_KEY` | Public variable | Captcha widget restricted to approved hostnames |

The public business email `info@nextstepprinting.com` is preserved in visible links, but is **not assumed as recipient or verified sender**. No other project's credentials are reused. Do not put secrets in Git or chat. Restrict Turnstile to actual approved hostnames; the handler checks hostname and `quote` action.

The server bounds requests, validates fields, checks origin, rejects a honeypot, verifies captcha, sends plain text, and controls recipient/sender. [Resend](https://resend.com/docs/api-reference/emails/send-email) idempotency keys protect retries. Success requires Resend acceptance with an email ID; this does not guarantee inbox delivery. Errors preserve input in current-page memory; personal data is not saved to browser storage.

For optional local Functions development:

```sh
npx wrangler@4 pages dev public --compatibility-date=2026-10-27
```

This downloads development tooling. Bindings can go in ignored `.dev.vars`. **Do not configure real sending credentials for tests.** `npm test` injects isolated providers; browser QA intercepts API/captcha requests. No real test email has been sent. Real delivery needs explicit authorization.

Wrangler 4.154.0 successfully compiled and served the migration locally. With the emulator running and no credentials configured, `node scripts/runtime-smoke.mjs` checks every route and the API's fail-closed responses.

## Validation and provenance

`npm run check` checks local references, forbidden dependencies, and secret patterns. `npm test` exercises the real handler with provider mocks. `scripts/browser.mjs` and `scripts/qa.mjs` are Windows/Edge-specific QA helpers; start the static server first. They are not hosted dependencies.

`node scripts/qa-motion.mjs` additionally verifies hover interpolation in both motion preferences, transparent/shrinking header states, gap-free masonry across breakpoints, animated resize/sort behavior, and immediate native scrolling.

`node scripts/qa-lightbox.mjs` checks borderless viewer layout, controls at desktop/mobile widths, pointer/keyboard navigation, closing, and focus/scroll restoration.

`node scripts/qa-navigation.mjs` checks desktop link fitting, the compact orange menu, mode changes/keyboard controls, and the copyright line on all 15 pages. An optional URL argument checks an approved remote review site instead of localhost.

`scripts/inspect.mjs` and `scripts/import-original.mjs` are one-time provenance tools, **not build commands**. The importer overwrites HTML; never rerun it over edited pages. Ignored `docs/reference/` contains raw originals, 45 original screenshots, local comparisons, and detailed QA logs. Tracked page/asset inventories summarize the capture.

Remaining work: owner visual review; Cloudflare setup; recipient/verified sender and credentials; final-hostname Turnstile validation; an explicitly authorized real delivery check. Social profiles and direct sharing links remain; authenticated sharing was not performed. The obsolete Google+ integration is removed. Native controls replace theme plugins. There is no former-provider or replacement developer credit.

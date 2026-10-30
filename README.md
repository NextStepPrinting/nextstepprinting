# Next Step Printing

> **Experimental redesign branch:** `feature/modern-redesign` contains a separate, owner-authorized modern design for all 15 pages. The approved production site remains on `main`. See [the redesign review guide](docs/redesign.md) for the design direction, local preview, preserved functionality, checks, and rollback workflow. Nothing on this branch has been deployed.

Faithful migration of [nextstepprinting.com](https://nextstepprinting.com/) to static HTML with Cloudflare Pages Functions and Resend. All 15 publicly linked pages are recreated. **The approved site is live on `main`; the owner has configured Resend and confirmed both forms work.** See [migration status](docs/migration-status.md) for evidence and remaining checks.

The approved `main` design uses the Contact/footer mockup and compact navigation. This experimental branch replaces the site presentation with the modern design documented above. Preview the experiment at `http://127.0.0.1:4173/` with `npm run dev` or the Windows helper below.

## Editing in VS Code

- `public/index.html`: home page.
- `public/about/`, `services/`, `graphic-design/`, `our-work/`, `get-a-quote/`, `contact/`: business pages; edit each folder's `index.html`.
- `public/portfolio/<original-slug>/index.html`: eight portfolio pages.
- `public/assets/styles/redesign.css`: active experimental design, header, responsive layouts, controls, and form states. `site.css` is retained as the approved-design reference.
- `public/assets/site.js`: menu, carousel, gallery dialog, sorting/sharing, and form behavior.
- `public/assets/images/YYYY/MM/`: original images and responsive derivatives, with original filenames.
- `public/assets/fonts/`: local Montserrat and original icon fonts.
- `public/assets/styles/*-layout.css`: original layouts retained for provenance; not loaded by this redesign. [Page inventory](docs/page-inventory.json) records the migration capture.
- `functions/api/quote.js`, `functions/api/contact.js`: quote/contact Pages Functions.
- `functions/_lib/message.js`: shared server-side validation, Turnstile verification, and Resend delivery.
- `functions/api/form-config.js`: exposes the public captcha site key and delivery-readiness boolean, never secrets.

Edit `public/`, not generated `dist/`. Text, images, and links are directly editable HTML. Headers/footers are currently repeated across pages, so shared changes require updating all 15 files. The footer is the semantic `.nsp-footer` block; active styles are in `redesign.css`. New semantic markup replaces theme wrapper structures. WordPress, PHP, jQuery, the original host, and theme styles/scripts are not required. Retain third-party license notices.

Our Work retains the masonry/sorting routine in `site.js`, styled in `redesign.css`. All project photographs retain their original image links. CSS transitions respect reduced-motion preferences, there is no automatic carousel, and window scrolling stays native.

The image viewer has a transparent stage over a dark backdrop, circular chevrons fixed to the viewer's side rails, a top-right X, and keyboard navigation. Arrows stay at the same screen position between photos. Its active style is in the `.nsp-lightbox` rules in `redesign.css`.

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
| Production branch | `main`; this experiment remains on `feature/modern-redesign` |

The owner has connected a Pages review site. Further deployments and DNS changes require authorization; pushing a connected branch can automatically deploy. `migration-base` is an empty review base, not production. `main` is now the production branch. `feature/website-migration` is fully contained in main and retained as history; `feature/modern-redesign` is the separate design experiment. Original page paths are retained; no page redirects are needed. Pages supplies normal directory/index URL handling.

References: [static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Functions development](https://developers.cloudflare.com/pages/functions/local-development/), and [bindings/secrets](https://developers.cloudflare.com/pages/functions/bindings/).

## Form setup

The original quote form has six required fields: Name, Email, Phone, City, Project Type (free text), and Project Details. **No upload field exists.** The proposed Contact form uses Name, Email, optional Phone, Subject, and Message. Its implemented `/api/contact` Pages Function reuses the same Resend service and `QUOTE_FROM`/`QUOTE_TO` configuration as `/api/quote`; no second paid service or invented delivery address is used. The original Contact page had only email links; the form is a new, explicitly requested feature.

Configure separately for each approved preview/production environment:

| Variable | Storage | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | Cloudflare secret | Resend sending credential |
| `QUOTE_FROM` | Server-side variable | Owner-confirmed address on a Resend-verified domain |
| `QUOTE_TO` | Server-side variable | Owner-confirmed recipient |
| `TURNSTILE_SECRET_KEY` | Cloudflare secret | Spam verification |
| `TURNSTILE_HOSTNAMES` | Server-side variable | Explicit comma-separated frontend allowlist; defaults to `nextstepprinting.pages.dev` |

The public business email `info@nextstepprinting.com` is preserved in visible links, but is **not assumed as recipient or verified sender**. No other project's credentials are reused. Do not put secrets in Git or chat. Restrict Turnstile to actual approved hostnames; the shared handler checks hostname and the route-specific `quote` or `contact` action. Both forms use the configured business inbox; a different Contact destination would need an explicit routing change.

The existing widget's public site key is `0x4AAAAAAFo4dXCxF6ZlPYBa`, stored in `functions/_lib/turnstile.js`; it does not need a Pages variable. The owner confirmed its matching secret is already stored in Pages as `TURNSTILE_SECRET_KEY`, and has now configured Resend and confirmed both production forms work. No widget was created/replaced or secret retrieved. The integration follows [Spin's existing-widget flow](https://developers.cloudflare.com/turnstile/spin/prompt.md) using the existing Pages secret destination. Widget rendering is independent of email readiness; `/api/form-config` exposes only the public key and a boolean `ready`. Incomplete sending configuration fails closed. Hostname validation uses an explicit allowlist and excludes localhost from production. Keep `nextstepprinting.pages.dev` in the widget's allowed hostnames. Add future approved production hosts in both the widget and `TURNSTILE_HOSTNAMES` before domain cutover.

Turnstile renders explicitly per form with `quote`/`contact` actions, expires/errors visibly, resets after every submission attempt, and switches to compact display when space is narrow. Backend acceptance requires `success === true`, the expected action, and the exact approved request hostname. Mocks cover replay rejection; real successful submission/replay remains pending separate email-test authorization.

The server bounds requests, validates fields, checks origin, rejects a honeypot, verifies captcha, sends plain text, and controls recipient/sender. [Resend](https://resend.com/docs/api-reference/emails/send-email) idempotency keys protect retries. Success requires Resend acceptance with an email ID; this does not guarantee inbox delivery. Errors preserve input in current-page memory; personal data is not saved to browser storage.

For optional local Functions development:

```sh
npx wrangler@4 pages dev public --compatibility-date=2026-10-27
```

This downloads development tooling. Bindings can go in ignored `.dev.vars`. **Do not configure real sending credentials for tests.** `npm test` injects isolated providers; browser QA intercepts API/captcha requests. No real test email has been sent. Real delivery needs explicit authorization.

Wrangler 4.154.0 successfully compiled and served the migration locally. With the emulator running and no credentials configured, `node scripts/runtime-smoke.mjs` checks every route and the API's fail-closed responses.

## Validation and provenance

`npm run check` checks local references, forbidden dependencies, and secret patterns. `npm test` exercises the real handler with provider mocks. `scripts/browser.mjs` and `scripts/qa.mjs` are Windows/Edge-specific QA helpers; start the static server first. They are not hosted dependencies.

`node scripts/qa-motion.mjs` additionally verifies hover interpolation in both motion preferences, compact fixed-size header states, gap-free masonry across breakpoints, animated resize/sort behavior, and immediate native scrolling.

`node scripts/qa-lightbox.mjs` checks borderless viewer layout, controls at desktop/mobile widths, pointer/keyboard navigation, closing, and focus/scroll restoration.

`node scripts/qa-navigation.mjs` checks desktop link fitting, the compact orange menu, mode changes/keyboard controls, and the copyright line on all 15 pages. An optional URL argument checks an approved remote review site instead of localhost.

`node scripts/qa-contact-footer.mjs` checks the local redesign at 1440/768/390/320px across all 15 pages, footer links/wrapping, contact cards/form labels/sticky header, and contact submission states with intercepted providers. It also compares the other 14 pages against a local pre-change main-content snapshot. The mockup's unverified opening hours and extra policy links are intentionally omitted. Google Maps links use the [documented cross-platform URL format](https://developers.google.com/maps/documentation/urls/get-started), with no map API key or embed dependency.

`scripts/inspect.mjs` and `scripts/import-original.mjs` are one-time provenance tools, **not build commands**. The importer overwrites HTML; never rerun it over edited pages. Ignored `docs/reference/` contains raw originals, 45 original screenshots, local comparisons, and detailed QA logs. Tracked page/asset inventories summarize the capture.

Remaining work: owner visual review; Cloudflare setup; recipient/verified sender and credentials; final-hostname Turnstile validation; an explicitly authorized real delivery check. Social profiles and direct sharing links remain; authenticated sharing was not performed. The obsolete Google+ integration is removed. Native controls replace theme plugins. There is no former-provider or replacement developer credit.

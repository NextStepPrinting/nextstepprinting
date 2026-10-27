# Migration status

Updated 2026-10-27. **Local site implemented; release and real email delivery remain pending.** No deployment, DNS change, live-site alteration, or real test email has occurred.

## Resumed in VS Code

The cloud attempt created only documentation. Its proxy blocked the original site; that cloud policy draft is historical and does not need activation here. Approved direct HTTPS retrieval works from Windows. The clean existing `feature/website-migration` checkout was used without a new worktree. `migration-base` remains an empty review base, not production.

Git and Node were missing from terminal PATH. Git exists at `C:\Program Files\Git\cmd\git.exe`. Initial checks used VS Code's bundled Node; `scripts/dev.ps1` provides this fallback. A checksum-verified portable Node 22 is in ignored `.preview/` for tooling checks. No system installation was changed.

## Inspection evidence

Source: [live website](https://nextstepprinting.com/), retrieved 2026-10-27. [Page inventory](page-inventory.json) records routes/titles/styles/forms; [asset inventory](asset-inventory.json) maps original paths to local files.

- 15 linked pages: home, About, Services, Our Work, Graphic Design, Get a Quote, Contact, and eight portfolio pages.
- Portfolio slugs: `misc`, `booths-buildings-walls`, `race-vehicles`, `encore-peterbilt`, `rhys-millen-jackal`, `project-x-trade-show`, `bud-light-gmg-porsche-vehicle-wrap`, `moab-tables`. Original slugs and differing display labels are retained.
- Raw HTML and 299 discovered asset paths were captured in ignored `docs/reference/`. Only images, CSS, and fonts ship; original JavaScript is excluded.
- All 15 originals were inspected in Edge at 1440/768/390 pixels after scrolling each page. Forty-five reference screenshots are in `docs/reference/screenshots/`; details are in `browser-all.log`.
- Branding: orange `#ff7e00`, Montserrat, separate desktop/mobile logos, 3M marks/tint graphics, project photographs, dark header/footer, and original photo banners.
- Header measured 185px on desktop, shrinking to 60px on scroll. Mobile initial header is 91.36px, with its own logo and normal-flow banner placement. Replacement measurements were corrected from `layout-debug-v4.log`.
- Menu: seven overlay navigation links at ordinary widths; no dropdown hierarchy. Footer repeats navigation, social profiles, address, phone, and email.
- Interactions: lightboxes, recent-work carousel, archive Name/Date and ASC/DESC sorting, portfolio galleries and sharing.
- No linked PDF/download, video embed, or upload input was found. Tint sheets are images.
- Original titles/canonicals are preserved. No page description metadata was found; descriptions were not invented.

### Quote/contact evidence

`/get-a-quote/` contains Name, Email, Phone, City, Project Type (text), Project Details (textarea), and a hidden WordPress submission flag. All visible fields have `zn_validate_not_empty`; original Email/Phone were text inputs. Action is `#`, using theme-managed WordPress submission. No submission was sent to the original endpoint. There is no upload field or attachment flow to recreate.

The contact page uses email links, not another form. Public email: `info@nextstepprinting.com`. Address: 10835 Kalama River Ave, Fountain Valley, CA 92708. Phone: 657.673.3146. These are preserved as business content, not inferred Resend configuration.

No Resend/Turnstile variables were found in this session environment. The previous owner decision to supply recipient and verified sender after implementation is retained. No separate project's credentials were reused.

## Implemented

- All original public page paths, business copy, titles/canonicals, photos, responsive derivatives, fonts, layouts, and business links are local editable HTML/CSS.
- Original CSS class names are retained as visual hooks, without WordPress/PHP, external theme assets, jQuery, or theme runtime scripts. License comments remain.
- Native wheel/touch scrolling and immediate links; no spinning loader, transition delay, former-provider credit/integration/link, or replacement developer credit.
- Independent menu, shrinking sticky header, native horizontal carousel, keyboard-operable gallery dialog, sorting, and direct social sharing without SDKs.
- Pages Functions bound/validate JSON and required fields, reject cross-origin/honeypot requests, verify Turnstile hostname/action, and send plain text through Resend. Retry idempotency is content-aware. Success requires accepted email ID. Missing setup fails closed; failure preserves entered values.
- Copy-only build from `public/` to ignored `dist/`; Functions stay at root. API-only Functions routes and static response headers are included.

The original Google+ share control cannot work: [Google terminated its integrations in 2019](https://developers.google.com/+/integrations-shutdown). That obsolete control is removed; other sharing remains. Native gallery/carousel controls replace plugin-specific transitions. CSS fixed-background treatment remains without JavaScript parallax or wheel interception.

## Verified locally

- **20 isolated server tests passed**: accepted delivery, retry identity, input limits/validation/injection, same origin, honeypot, captcha hostname/action, provider rejection/missing ID/exception, missing setup, and safe public configuration. All provider calls were mocked.
- **15 pages and 310 local references passed** static checking, including responsive image targets and the mobile logo.
- **45 Edge route/width checks passed** at 1440/768/390: no horizontal overflow, broken loaded images, invalid content anchors, loader, modified scroll behavior, or JavaScript exceptions. Lazy images were decoded before full-page checks. Results: ignored `docs/reference/local-qa.json`; screenshots: `docs/reference/local/`.
- Browser interactions passed: menu open/Escape close, gallery open/close, archive name sorting, required validation, sending/disabled state, failed-input preservation, and successful reset. API/config/captcha responses were intercepted; no real provider request/email occurred.
- Static preview intentionally returns 503 for APIs. Those expected network errors are distinguished from unexpected console/runtime failures.
- **Cloudflare runtime verified:** Wrangler 4.154.0 compiled the Worker successfully, parsed the response headers, and served all 15 pages locally. Runtime smoke checks passed for static headers, missing configuration (503), unsupported method (405), and cross-origin submission (403). No provider credentials/calls were involved. Details: `docs/reference/wrangler-local.log`; repeat with `scripts/runtime-smoke.mjs` while the emulator runs.
- Representative original/local home, services, about, and mobile quote screenshots were reviewed. Background escaping, mobile banner/logo flow, sticky sizing, footer email color, and skip links were corrected. Owner visual review remains; exact pixel parity is not claimed.

## Remaining release prerequisites

1. Owner visual review and any corrections on the feature branch.
2. Confirm recipient and Resend-verified sender. Configure `QUOTE_TO`, `QUOTE_FROM`, secret `RESEND_API_KEY`, public `TURNSTILE_SITE_KEY`, and secret `TURNSTILE_SECRET_KEY` separately per approved environment. Never paste keys into chat/Git.
3. Choose the future production branch and authorize Pages setup/deployment. README specifies None preset, root `/`, `npm run build`, `dist`, Node 22, root Functions, API routes, and compatibility date. No production branch is established.
4. Authorize a real delivery check separately. Verified-domain/account behavior and inbox receipt are untested.
5. Real Turnstile verification on approved hostnames and authenticated social-sharing completion remain external checks. No posts were made.
6. Production cutover/DNS needs separate explicit authorization.

The original production site is untouched. The migration is not fully complete while required configuration and delivery validation remain unresolved.

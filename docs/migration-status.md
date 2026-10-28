# Migration status

Updated 2026-10-27. **A Pages review copy is live; custom-domain cutover and real email delivery remain pending.** The owner has proceeded with Pages setup since the initial migration. The agent has not changed DNS, altered the original website, or sent a real test email.

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
- Header measured 185px on desktop, shrinking to 60px on scroll. Mobile initial header is 91.36px, with its own logo and normal-flow banner placement. The later motion inspection confirmed the desktop header is transparent at the top and becomes dark when scrolling crosses 1px.
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
3. Confirm the long-term release branch after review. The owner's Pages setup screen selected `feature/website-migration`; the review address now responds successfully. Because GitHub pushes can trigger Pages deployments, further publishing needs explicit authorization. README specifies None preset, root `/`, `npm run build`, `dist`, Node 22, root Functions, API routes, and compatibility date.
4. Authorize a real delivery check separately. Verified-domain/account behavior and inbox receipt are untested.
5. Real Turnstile verification on approved hostnames and authenticated social-sharing completion remain external checks. No posts were made.
6. Production cutover/DNS needs separate explicit authorization.

The original production site is untouched. The migration is not fully complete while required configuration and delivery validation remain unresolved.

## Hover, header, and masonry correction — 2026-10-27

The owner reported missing hover transitions, an opaque initial desktop header, abrupt sticky-header changes, and a blank slot/row gaps in the Our Work grid.

Fresh live inspection covered Home and Our Work hover states, footer pseudo-elements, header positions/backgrounds at multiple scroll offsets, and original gallery geometry. `docs/reference/motion-inspection.json` contains original/local before-change computed styles. This machine reports `prefers-reduced-motion: reduce`; the migration's blanket `transition:none !important` rule therefore suppressed all original hover transitions. The original site continues to apply its small hover fades in the same environment. The gallery's replacement CSS grid also placed the original clearfix pseudo-element into the first cell and stretched cards into rows instead of packing them by height.

Changes:

- Removed the blanket transition suppression. Original button/image/overlay/footer hover rules work again, including the footer dash growing from 8px to 12px. Reduced-motion mode shortens header/gallery relocation rather than removing all interaction feedback; automatic carousel movement remains suppressed in that mode.
- Desktop header starts transparent, then smoothly changes background and shrinks from 185px to 60px once scrolling starts, reversing on return to the top. Mobile retains the original dark, normal-flow initial header. Menu opening/closing now fades, hamburger strokes transition, and carousel controls scroll only their own horizontal container smoothly.
- A small dependency-free masonry routine places each card in the shortest column and animates its transform on resize/sort. Breakpoints match the source: four columns above 992px, three through 992px, two through 768px, one through 480px. Clearfix pseudo-elements no longer become cards. Intrinsic image dimensions reserve the correct space before photos load.
- Window wheel/touch scrolling remains native and immediate. No smooth-scroll plugin, navigation delay, WordPress script, or former-provider integration was restored. Form handlers and credentials are unchanged.

Focused Edge checks passed for actual intermediate animation frames, not only CSS declarations: footer width and image opacity interpolate in both motion preferences; the header shrinks/fades and restores correctly; cards pack without gaps/overlap at nine viewport widths, move through intermediate positions on resize, and repack after all sorting controls. Mobile header flow and immediate native `scrollTo` were verified. The 20 isolated form tests, static route/asset checks, and copy build also pass. `scripts/qa-motion.mjs` repeats these checks; [recorded motion results](evidence/motion-results.json) contain the measurements. All 45 responsive regression checks and isolated form/menu/gallery interactions passed again after these changes, with zero JavaScript exceptions or broken assets. [Updated gallery image](evidence/our-work-masonry.jpg) shows the transparent header and packed cards; browser-results.json and the home comparison were refreshed.

The Pages review address `https://nextstepprinting.pages.dev/` returned HTTP 200 during read-only inspection. The owner subsequently authorized publishing these corrections together with the lightbox refinement below. Authorization covers the Pages review update; custom-domain/DNS cutover and real email testing remain separate.

## Borderless image viewer — 2026-10-27

At the owner's request, the viewer keeps its dark backdrop and previous/next navigation while removing the solid panel and rectangular text buttons. Circular chevron controls sit directly outside the left/right image edges, centered vertically. A symmetric SVG X sits at the top-right of the viewport. The dialog/stage are transparent, with a quiet image counter beneath the photo and a short image fade. Touch targets are 44px and arrow space is reserved even at 320px viewport width.

Keyboard arrows, Escape, wraparound navigation, backdrop-click close, accessible button labels, native modal focus handling, focus return, and background-scroll restoration are preserved. The surrounding page is not scrolled or animated by the viewer. No assets, dependencies, provider integrations, or form delivery logic were added.

`scripts/qa-lightbox.mjs` passed portrait/landscape geometry checks at 1440/768/390/320px, actual arrow/X click tests, keyboard navigation/wrapping, Escape/backdrop close, focus return, and scroll restoration. Dialog transparency and absence of the old text-button panel were verified. [Desktop capture](evidence/lightbox-desktop.jpg), [mobile capture](evidence/lightbox-mobile.jpg), and [recorded checks](evidence/lightbox-results.json) are included for review. The final 45 responsive page checks and isolated form/menu/gallery interactions passed, as did the focused hover/header/masonry checks and the static check/build. No JavaScript exceptions or broken images were found. Deployment verification is reported after the authorized push.

## Fixed viewer controls and responsive navigation — 2026-10-27

The owner requested one final refinement to the same Pages review update: fixed arrow targets between images, the original horizontal navigation with a narrower switching width, a more legible orange compact menu, and removal of the copyright line's trailing space/period. Unrelated source-site issues are deferred as requested.

- Viewer chevrons are now fixed to the side rails of the available image area, vertically centered in the viewport. They do not depend on the current photo's aspect ratio and require no extra full-size image downloads. The image bounds still reserve space so arrows cannot overlap the widest supported image. Tests compare exact control rectangles across different photos at desktop/mobile sizes.
- Horizontal navigation is restored from 1100px, compared with the source CSS's 1922px switch. All seven original URLs remain. The logo and row fit without overlap at the boundary, and compact/sticky-header states remain intact. Header markup was updated consistently on all 15 pages to place the navigation in the header row.
- Below 1100px, the menu retains source orange `#ff7e00`, with bold charcoal text, an understated active marker, and the existing fade/close/keyboard behavior. Resizing across the boundary cancels overlay animation, clears its scroll lock, and keeps links accessible. It does not unlock a separately open lightbox.
- Removed the standalone `. ` span after the copyright text in every footer; no business copy or other source-site issues were changed.

`scripts/qa-navigation.mjs` passed eleven widths from 320 to 2200px, initial/scrolled desktop fitting, orange/charcoal overlay styling, keyboard focus wrapping and Escape, resize mode changes, separate lightbox scroll-lock preservation, and exact copyright endings on all 15 routes. The updated viewer checks passed unchanged-position assertions alongside navigation/closing behavior at 1440/768/390/320px. [Desktop menu capture](evidence/navigation-desktop.jpg), [compact menu capture](evidence/navigation-mobile.jpg), and [navigation measurements](evidence/navigation-results.json) record the results. All 45 responsive page checks, isolated browser form interactions, 20 mocked server-form tests, focused hover/header/masonry regressions, static checks, and the build passed again. This is a continuation of the authorized Pages review update; domain cutover and real email remain outside scope.

## White compact-menu text and contact email — 2026-10-27

At the owner's request, compact-menu labels are now white with their existing 700 weight, sizing, and orange panel. The pale hover/current-link rectangles are removed. A white 2px underline scales from zero to full text width around its center on hover or keyboard focus; its intermediate transform and centered origin are verified in Edge. The desktop navigation retains its existing active-button treatment. Keyboard focus outlines remain visible.

The email link in the contact page's orange information strip is now white, scoped to that strip so the separate link on the light section and footer keep their existing colors. The address, mailto destination, forms, and other content are unchanged.

Updated navigation checks passed at eleven widths, including actual underline interpolation at compact desktop/mobile sizes, white text and unchanged font weight, transparent hover backgrounds, keyboard/resize/scroll-lock behavior, and all footer endings. Contact-strip email color and the unchanged readable lower link were checked at 1440/768/390px. Static checks, the 20 mocked server-form tests, and the build pass. All 45 responsive page checks and isolated browser form/menu/gallery interactions passed again, with no JavaScript exceptions or broken images. [Menu capture](evidence/navigation-mobile.jpg), [contact-strip capture](evidence/contact-strip.jpg), and [navigation measurements](evidence/navigation-results.json) record verification before publishing this continuation of the authorized review update.

Follow-up: the compact menu's close X now also uses white, matching its labels. A targeted Edge check confirmed both visible strokes render white and the menu still closes without JavaScript exceptions. Static reference/secret checks and the build passed; this is a color-only change.

## Contact and shared-footer redesign — local proposal, 2026-10-27

The owner explicitly authorized a scoped redesign from the attached desktop/mobile mockup, superseding the migration-only restriction for the Contact page, necessary navigation adjustments, and shared footer. The leading instruction selects **Footer Option B**, despite the later boilerplate reference to A. **Do not commit, push, or deploy this proposal until the owner approves.** The live Pages review site is unchanged by this work.

Inspection found a buildless HTML/CSS/JavaScript site, a repeated `znpb-footer-smart-area` block in all 15 pages, and an existing Resend/Turnstile Pages Functions backend for quotes. The old Contact page had a large orange information band, a repeated email address, and no form. No local Resend/Turnstile configuration variables or `.dev.vars` entries were found. The original business data, public routes, social-profile URLs, page titles, and canonical metadata are preserved. The mockup's business hours, sunset replacement image, new copyright year, and policy links are not established source content and were not invented.

Implemented locally:

- Contact-only solid charcoal/sticky navigation keeps the current shared links, hamburger styling, and logo. Other page headers remain unchanged.
- The existing orange Lamborghini asset `NSP_Home.jpg` supports a new Contact Us hero with the existing introductory sentence. Three equal cards show location, phone, and email; mobile uses compact divided rows. Google Maps, `tel:`, and `mailto:` links are implemented. The email appears once in the main content, plus the required shared-footer contact line.
- A labeled, responsive form contains Name, Email, optional Phone, Subject, and Message. `/api/contact` is an actual Pages Function, backed by the extracted shared `functions/_lib/message.js` service; `/api/quote` keeps its existing interface. Contact uses the existing configured sender/recipient (`QUOTE_FROM`, `QUOTE_TO`) and Resend key, verifies a `contact` Turnstile action, validates bounded input, rejects spam/origin failures, preserves failed input, and requires provider acceptance before success. No new paid service, destination address, or secret is assumed. Unconfigured previews clearly report messaging unavailable and provide the working email link.
- Footer Option B replaces the old oversized footer on all 15 pages: small horizontal logo, seven navigation links, original social icons/links, a divided contact row, and existing copyright. Grid/Flexbox adapt the layout without fixed heights. Other 14 pages' HTML before the footer was verified byte-for-byte unchanged against a local pre-change snapshot.

Final verification: all 33 isolated provider tests pass (20 existing quote tests plus 13 contact tests). Sixty page/viewport checks at 1440/768/390/320px verified no horizontal overflow or broken images, footer links and wrapping, equal desktop cards/stacked mobile rows, labels and optional-phone behavior, sticky/contact/mobile navigation, and mocked contact loading/failure preservation/success reset. All 45 existing responsive page checks and mocked quote-form interactions also passed, along with navigation/keyboard/scroll-lock regressions. Cloudflare Wrangler compiled the shared backend successfully; local runtime checks confirmed both routes fail closed without credentials. Static checks cover 15 pages and 308 local references; the copy build passes. No real email has been sent. [Local screenshots and recorded checks](evidence/README.md) support visual review. All other 14 pages' pre-footer HTML is unchanged, verified against the recorded baseline hashes.

Remaining: owner visual approval; confirmation/configuration of the existing sender, recipient, Resend and Turnstile settings before real delivery; explicit authorization for a real email test and any later publication. No Git mutation or production action is authorized for this proposal.

## Approved publication, compact header, existing Turnstile widget — 2026-10-27

The owner approved the Contact/Footer B redesign and explicitly authorized deployment after making navigation consistent. This supersedes the preceding local-only restriction. All pages now start with the same 60px dark navigation bar, preserving desktop/compact menus without a scroll-driven resize. Contact uses the same logo dimensions and header spacing; its navigation remains in normal flow/sticky above the hero.

The owner supplied existing public site key `0x4AAAAAAFo4dXCxF6ZlPYBa` and confirmed that its secret is already stored in the Pages project as `TURNSTILE_SECRET_KEY`. The exact [Spin prompt](https://developers.cloudflare.com/turnstile/spin/prompt.md) was fetched and its existing-widget flow followed. No replacement widget, domain changes, or pre-clearance changes were made. No supported, owner-approved external Wrangler or Cloudflare API credentials exist in this session for automatic secret retrieval; no secret getter/write was attempted. The confirmed existing Pages secret is used instead. Project-local Wrangler is used only for credential-free local runtime checks, never secret-bearing commands.

The owner clarified that **Resend is not configured; only Turnstile has been added**. Email submission therefore remains intentionally unavailable while the public widget can render. No Resend setup, destination assumption, or real delivery test is part of this update. Real protected-handler acceptance/replay validation also remains pending because the unchanged successful handler would send email.

The public key is wired into `/api/form-config`. Its response includes the public key and readiness boolean, so the widget can render even if email configuration is incomplete. Browser submissions preserve existing handlers, use `quote`/`contact` actions, handle expiration/error, reset per-widget after attempts, and choose compact/flexible sizing without mobile overflow. Server verification requires strict `success === true`, the correct action, and an explicit approved hostname matching the request. `TURNSTILE_HOSTNAMES` defaults to `nextstepprinting.pages.dev`; localhost is excluded from production. Widget hostname allowance is verified as far as live access permits after deployment.

Forty isolated server tests pass, including strict-verdict rejection, hostname rejection, mocked replay rejection, and the original quote/contact delivery tests. Sixty redesign layout checks, 45 existing responsive/interaction checks, compact-header/hover/masonry checks, static references, and build pass. Credential-free Wrangler runtime checks confirm public widget configuration and fail-closed delivery. No real test email was sent. Real successful protected submission and replay validation are deliberately pending because the existing successful handler sends email, which still requires separate explicit authorization; end-to-end delivery is not claimed.

Published to the existing Pages Git deployment after owner approval. Live SHA-256 comparisons matched all 15 HTML routes, shared CSS and JavaScript. Live Contact and Quote checks confirmed 60px navigation, the shared footer, no desktop overflow, and `/api/form-config` returning the provided public key with `ready:false`. Both real widgets load but report Cloudflare error `110200` (domain not authorized), documented in [Cloudflare's error reference](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/). The owner must add `nextstepprinting.pages.dev` to the existing widget's Hostname Management before a live challenge can succeed. No widget settings were changed by the agent. The unavailable-email notice remains visible even when CAPTCHA errors or expires. No real form submission or email was made. Live challenge success remains pending hostname authorization; actual email delivery additionally requires Resend configuration.

### Follow-up verification and header spacing — 2026-10-27

The owner added the Pages hostname to the existing Turnstile widget. A fresh browser with caching disabled displayed the interactive widget on both Contact and Quote with no Turnstile errors or JavaScript exceptions. No challenge completion, server-side token acceptance, or email delivery is claimed; Resend remains unconfigured.

At the owner's request, the local shared layout now reserves 60px above page content for the fixed navigation. Mobile retains its in-flow header and matching space when fixed during scrolling; Contact retains its in-flow sticky header without extra padding. Browser checks on all 15 pages at 1440/768/390px confirmed content starts at 60px, no layout jump after scrolling, and no horizontal overflow. Evidence: ignored `docs/reference/header-spacing-results.json`. Static checks and build pass. The owner subsequently authorized publication of this spacing adjustment through the existing Pages Git deployment.

### Homepage-only brand transition, local review — 2026-10-28

The owner requested an independently enlarged homepage logo while retaining the compact navigation. The existing `.home` body class scopes a desktop-only (1100px and wider) transform on the single existing logo link: approximately 535px wide at the top, with its visible artwork approximately 25px below the 60px navigation bar (accounting for the existing asset transparency), extending into the hero with the original stroked artwork and a subtle drop shadow. At 80px scroll, the same logo transforms back to its original compact position over 300ms. The shared scroll listener updates a homepage-only state class; header dimensions, background, position, navigation link positions, reserved content space, and all other pages remain unchanged. Tablet/compact-menu and mobile widths keep the compact logo. Reduced-motion preference removes the animation.

Local browser checks covered 1440/1200/1100/1099/768/390px with both motion preferences, the 79/80px threshold, intermediate animation, returning to the top, a single logo, and stationary navigation/content without overflow or scroll-height changes. All 14 other page headers were verified unchanged at the top and after scrolling; no JavaScript exceptions occurred. Screenshots of desktop top/compact states and tablet/mobile plus detailed results are in ignored `docs/reference/home-logo/`. Static checks, isolated backend tests, and build pass. No email sent. The owner approved the preview and explicitly authorized deployment on 2026-10-28 through the existing Pages Git integration. The local default browser reports reduced motion enabled; the instant state change in that mode is intentional. Animation was verified with no-preference emulation.

### Consistent interior-page banners, local review — 2026-10-28

The owner requested the Contact banner's positioning, typography, and subtext treatment throughout the other pages, and explicitly approved drafting short subheadings where no introduction existed. Thirteen interior-page banners now share Contact's responsive spacing, bold Montserrat title, white subtext, and left alignment. Existing banner photographs on About, Services, Our Work, Graphic Design, and Get a Quote are preserved with a readability gradient. The eight project pages retain their image-free banner treatment using charcoal and keep their breadcrumb links and date in a separate compact row. Draft subheadings refer only to existing services/project subjects; no new business claims, assets, endpoints, or dependencies were introduced.

The homepage hero/logo, Contact markup, shared navigation, JavaScript, form handlers, and all page markup outside the thirteen banner regions are unchanged. Previous pre-banner-redesign hash evidence is historical; this deliberately authorized banner change supersedes those exact-prefix comparisons. New before/after boundary hashes and a detailed banner scope record are in ignored `docs/reference/page-heroes/scope.json`.

Fifty-two focused checks at 1440/768/390/320px confirmed matching Contact title/subtext typography and left alignment, readable wrapping with no clipping, no horizontal overflow, preserved background images and breadcrumb links, no broken image sources, and no JavaScript exceptions. Checks exclude the deliberately empty image in an unopened lightbox. Screenshots and results are in ignored `docs/reference/page-heroes/`. All 45 existing responsive page checks plus menu, lightbox, gallery sorting, and isolated form browser states pass. All 40 isolated backend tests, static route/asset checks, and the build pass. No real email was sent. The owner approved the local preview and explicitly authorized publication through the existing Pages Git integration on 2026-10-28.

### Banner artwork centering, local review — 2026-10-28

The owner reported apparent navigation overlap on every page and supplied a Services screenshot showing the central N emblem cut off at the banner's top. Fresh layout checks had measured the banner correctly starting below the 60px navigation. The screenshot identified a separate issue: all interior banners inherited the Contact photograph's 58% vertical focal-point offset, shifting artwork upward within a cover-cropped banner. The earlier local-only sticky-header experiment did not address that issue and was removed before publication; the established navigation layout and homepage logo behavior remain unchanged.

The shared Contact/interior banner rule now vertically centers its background image (50%) across the site. Mobile already uses centered vertical positioning. The homepage images already use centered positioning and are unchanged. No image asset, banner heading, subtext, navigation layout, or page content is changed. The Services screenshot at 1789px now shows the entire central N emblem between the navigation and white content, with space above and below. Checks confirm centered background images on all 14 interior pages at 1789/768/390px, unchanged 60px header/banner boundaries, no horizontal overflow, and no JavaScript exceptions. The existing desktop/tablet homepage image is also centered; the mobile homepage has no photo hero. Raw screenshots/checks are saved in ignored `docs/reference/banner-crop/`. Static checks and build pass. The owner approved the corrected preview and explicitly authorized publication through the existing Pages Git integration on 2026-10-28.

### Graphic Design mockup implementation, local review — 2026-10-28

The owner approved the generated Graphic Design concept and asked about implementation using available images. The generated mockup itself is not a website asset. The Graphic Design page body now follows its portfolio-led structure: the existing introduction and quote link beside a larger Lexus feature, a charcoal concept/print/finished-wrap sequence, three large real project previews, links to all six original portfolio destinations, the existing full-work-gallery link, and a closing quote invitation. Existing introductory and gallery copy is retained. Per owner review, the process labels are now THE CONCEPT, THE PRINT, and THE WRAP, with no descriptions. The closing banner uses the homepage motto, “Take Your Project to the NEXT STEP!”, in italic instead of repeating “Elevate Your Brand.” Quote-button text/arrows and the closing orange-bar heading are white; CSS-only diagonal shadow bands reproduce the mockup accents. No invented quality claims or illustrative truck branding are used.

All imagery uses existing local originals. `public/assets/images/2023/03/Lexus_3.jpg` is a 1650×1423 collage containing the vehicle design sheet, printed vinyl, and completed Lexus RX F-Sport. CSS crop windows display those regions independently without editing, generating, or adding image files. The featured image opens the full collage through the existing lightbox. Portfolio previews reuse the original Hyundai, wall graphics, and transport-trailer photographs. Separate original Lexus photos would allow cleaner independent crops, but are not necessary for this implementation.

Only `public/graphic-design/index.html` body content and new uniquely prefixed `.nsp-design-*` styles are changed. Header, banner, metadata, and footer are verified byte-for-byte unchanged against before/after boundary hashes. Other pages, shared JavaScript, assets, forms, and providers are unchanged. Eight browser viewport checks at 1920/1440/1100/1024/768/767/390/320px passed for layout, source crops, all six project routes, quote links, single-column mobile layouts, full-image lightbox/Escape/focus return, mobile navigation, no broken images or horizontal overflow, and no JavaScript exceptions. Screenshots, boundary hashes, and results are in ignored `docs/reference/graphic-design/`. Static route/asset checks, all 40 isolated backend tests, and build pass; no real email sent. The owner approved the final preview and authorized publication after italicizing the closing motto on 2026-10-28. Final eight-width layout and interaction checks, static checks, and build pass.

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

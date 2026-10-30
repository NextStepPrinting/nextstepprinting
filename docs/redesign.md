# Modern redesign experiment

Branch: `feature/modern-redesign`, based on approved `main` commit `a869189`.

The owner explicitly authorized a complete, disposable redesign on October 30, 2026. This authorization supersedes the original faithful-migration appearance restriction **on this branch only**. Production, DNS, GitHub defaults, and Cloudflare settings are unchanged. No new service, dependency, generated image, credential, or email provider was introduced.

## Direction

An editorial print-studio identity: warm off-white, deep charcoal, the existing orange branding, oversized typography, generous real project photography, and clear next steps. The navigation remains in its own sticky row. The homepage now leads with a split photographic hero, selected work, a service overview, and the studio story. Interior pages use strong introductions rather than generic photo banners. Services have individual illustrated sections. The project index retains name/date sorting and image previews; individual collections use natural-ratio photographs with the existing full-screen image viewer. The Graphic Design concept-to-wrap presentation is carried forward. Contact and quote use labeled, responsive forms.

Only two local stylesheets load: existing `fonts.css` and new `redesign.css`. Original theme assets and license notices remain in the repository as provenance, but their stylesheets are not loaded by the redesigned pages. The build is still the dependency-free copy into `dist/`; no Cloudflare build-setting change is needed.

## Preserved

- All 15 page routes, original page titles, canonical links, business contact information, original social destinations, four service offerings, and original gallery subjects.
- All 86 original project-gallery image links, recorded in [redesign-inventory.json](evidence/redesign-inventory.json). Existing images and local fonts are reused, with intrinsic dimensions added to prevent image layout shifts.
- Resend/Turnstile Pages Functions and shared frontend form handlers. Contact's phone is optional; Quote's phone, city, project type, and details remain required. Sender, recipient, keys, CAPTCHA actions, validation, and failure-preservation behavior are unchanged.
- Native scrolling, immediate navigation, accessible mobile-menu keyboard handling, full-image viewer, sorting, and CSS reduced-motion support.

Headlines and introductory copy were edited within the owner-authorized redesign scope. Business claims are grounded in existing content; the 20+ years figure and 3M dealer artwork were already present. No invented testimonials, clients, opening hours, prices, or new services were added. Project gallery subjects and the source filenames stay the same. The Lexus process imagery is still drawn from the original collage; separate original photos would improve isolation and remain a future owner-supplied enhancement.

## Preview and checks

Run `npm run dev` and open `http://127.0.0.1:4173/`. The static preview intentionally cannot send email. Production forms were previously confirmed working by the owner; testing here uses only isolated mocks.

Required checks remain:

```text
npm run check
npm test
npm run build
```

With the preview running, the Windows/Edge review helpers are:

```text
node scripts/qa-redesign.mjs
node scripts/qa-redesign-forms.mjs
```

The browser helper disables extensions and account sync to isolate QA. Its profiles and screenshots remain ignored. Raw review evidence is in `docs/reference/modern-redesign/`: desktop/mobile screenshots, 75 page/viewport checks, and mocked Contact/Quote results. Layout checks cover all pages at 1440/1024/768/390/320px, metadata, source photo preservation, single primary headings, sticky navigation, clipping, overflow, and image loading. Interaction checks cover the mobile menu, keyboard dismissal, sorting, and full-screen image viewer. Form checks cover both forms on desktop and mobile, required versus optional phone, bounded fields, correct endpoint/action, disabled sending state, failure retention, acceptance-only success, CAPTCHA reset, and unavailable configuration.

The older migration-specific visual scripts intentionally describe the approved `main` layout and are not the acceptance criteria for this redesign. Their historical evidence has not been overwritten.

## Comparing or discarding

This branch is committed locally for review. It has not been merged, pushed, or deployed. Switching back to `main` restores the approved version; switching back to `feature/modern-redesign` restores this experiment. Do not delete either branch while it is checked out or has uncommitted work.

`feature/website-migration` is fully contained in `main`, so it is no longer needed for active development. It is retained as a historical reference; it has not been deleted.

Publishing a remote branch can automatically trigger a Cloudflare Preview deployment. Arrange that separately from this local review. A production cutover still requires explicit owner approval. Main remains the rollback reference.

## First review fixes

The homepage hero photo and its “Our work speaks for itself” caption now form one native link to `/our-work/`, with hover and visible keyboard-focus feedback. Responsive images now default to `height:auto`; this fixes the Services 3M dealer logo, whose intrinsic HTML height had been retained while its width shrank. The source image is unchanged. Four-width checks at 1440/768/390/320px confirm keyboard navigation and the logo's original 5:1 proportions, with no overflow or JavaScript exceptions. Evidence is in ignored `docs/reference/modern-redesign/review-fixes.json`. Static checks and build pass. These fixes remain on the local experiment branch.

# Representative comparisons

Captured 2026-10-27. **Original on the left; migration on the right.**

- [Desktop home](home-desktop.jpg), originally captured at 1440px.
- [Mobile quote](quote-mobile.jpg), originally captured at 390px.
- [Updated Our Work layout](our-work-masonry.jpg), a local 1440px capture after the hover/header/masonry corrections (single image, not a comparison).
- [Motion checks](motion-results.json): intermediate hover/header animation values and masonry packing/resize checks.
- [Desktop lightbox](lightbox-desktop.jpg) and [mobile lightbox](lightbox-mobile.jpg): transparent viewer, circular side arrows, and top-right X (local captures).
- [Lightbox checks](lightbox-results.json): responsive geometry, navigation, closing, and focus/scroll restoration.
- [Desktop navigation](navigation-desktop.jpg) and [orange compact menu](navigation-mobile.jpg): local captures of the restored horizontal navigation and updated overlay.
- [Navigation checks](navigation-results.json): eleven viewport sizes, mode switching, keyboard behavior, scroll locks, and all 15 copyright lines.
- [Contact details strip](contact-strip.jpg): white email text matching the other details on orange. Navigation checks also record white compact-menu text and intermediate center-out underline values.

## Local Contact/footer proposal (not published)

- [Desktop Contact page](contact-local-desktop.jpg), [tablet](contact-local-tablet.jpg), and [mobile](contact-local-mobile.jpg).
- [Footer Option B](footer-local-desktop.jpg): compact horizontal brand/navigation/social row above the contact details.
- [Redesign checks](contact-footer-results.json): 60 page/viewport checks and isolated contact-form states. [Baseline hashes](contact-footer-main-baseline.json) verify that the other pages' pre-footer HTML was preserved.

The message-unavailable notice in the screenshots is intentional: the static local preview has no email delivery configured. The live review site still has the prior design; these files are a local proposal awaiting approval.

The local quote page shows its intentional unavailable message because no provider credentials are configured. That adds height to the form. The old credit appears only in the original-reference half; it is absent from the migrated application. Full-page captures do not reliably paint native fixed backgrounds outside the visible viewport, so those regions also need ordinary scrolling review.

Raw captures for all 15 routes at three widths, machine results, and source snapshots remain in ignored `docs/reference/` in the working checkout. Tracked inventories and migration-status.md record the scope. These images are review evidence, not a claim of exact pixel parity.

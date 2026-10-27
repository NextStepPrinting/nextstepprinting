# Next Step Printing migration

This is an authorized, faithful migration of https://nextstepprinting.com/ to Cloudflare Pages. It is not a redesign.

- Inspect the live site's linked pages, desktop/mobile layouts, forms, and original assets before implementing them. Record evidence and unresolved gaps in `docs/migration-status.md`. Do not invent missing content, assets, endpoints, or credentials.
- Prefer editable HTML, CSS, minimal JavaScript, and local assets. Explain any build step and document exact Cloudflare settings once implemented.
- Preserve business branding, page URLs, content, metadata, responsive behavior, form fields, and intended functionality.
- Use native scrolling and immediate navigation. Remove Movement Garage credits, scripts, integrations, branding, links, and dependencies; do not add a replacement developer credit.
- Keep form delivery server-side using Resend and Cloudflare Pages Functions. Never expose credentials. Validate input server-side, limit spam, preserve failed submissions, and report success only when Resend accepts the request. Investigate original file uploads before choosing their implementation.
- Never send a real test email without explicit authorization. Use isolated provider mocks for tests.
- Work on a dedicated feature branch. Do not deploy, change production DNS, alter the live site, or push application changes to a production branch without authorization.
- This cloud task already has an isolated checkout. Use it; do not create worktrees unless requested.
- Before committing, inspect the diff for secrets and provider dependencies. Verify local pages, links, assets, responsive layouts, browser console, and forms. Distinguish verified results from pending or blocked checks.

The repository began empty. `migration-base` contains an empty root commit for review; `feature/website-migration` is the working branch. No production branch or deployment has been established by this migration.

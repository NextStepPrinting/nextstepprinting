# Next Step Printing

Faithful migration of [nextstepprinting.com](https://nextstepprinting.com/) to a static website hosted by Cloudflare Pages, with server-side Resend form delivery.

**Status: inspection blocked; the website has not been recreated.** See [migration status](docs/migration-status.md). There is no deployable website yet.

## Current structure

- `AGENTS.md`: project guidance for future coding tasks.
- `docs/migration-status.md`: inspection evidence, blockers, and outstanding validation.

These Markdown files can be edited directly in VS Code. Website source files, local assets, and development/build commands will be documented after the original site is inspected. No application dependencies or build step have been introduced.

## Branches

The remote repository was empty, with no existing commits or branches. A local `migration-base` branch contains an empty initial commit so that `feature/website-migration` can be reviewed against a base. This does not establish a production release or authorize a deployment.

## Planned hosting and forms

GitHub will be the source of truth. Cloudflare Pages will host static files; Pages Functions will handle email delivery through Resend. Exact build/output settings are pending implementation; do not configure a production deployment from this preliminary repository.

No credentials are committed. Configure the Resend API key as a Cloudflare secret, never in browser code. Recipient and verified sender addresses must be supplied or confirmed before delivery is enabled. The existing forms, including any file-upload requirements, have not yet been inspected. No real test email has been sent.

## Remaining setup

The cloud environment currently blocks access to the original website. Required destination domains have been saved to the environment configuration draft for review. Review and save those settings and publish the environment as prompted, then resume inspection. Additional asset domains may be required after discovery.

Page inventory, asset organization, redirects, external dependencies, local commands, Cloudflare settings, and functional/visual validation remain pending. No unsupported claim of visual or functional parity is made.

# ATANDA.ai → ARK-X

## Approved ownership

ATANDA.ai shows the complete ARK-X interface and uses existing ARK-X accounts,
data and authorization. The domain, GitHub repository and Cloudflare Workers
Git deployment remain in place. No legacy account or subscription migration
is required; the old source and backend data are not deleted.

## Request path

`Browser → existing atanda-fe Cloudflare Worker → https://arkatanda.replit.app`

The Worker serves **every** UI route, static asset and API from the same
ARK-X deployment. It does not serve the legacy SPA, translate `/v1` contracts,
grant access, simulate success, or redirect the whole website away from ATANDA.
This keeps the UI and API on compatible versions when ARK-X is republished.

Browser requests remain same-origin. Session cookies are host-only, Secure,
HttpOnly and SameSite=Lax as issued by ARK-X. A user signs in to their ARK-X
account at ATANDA; existing cookies from another hostname are not imported.
All authorization and entitlements remain enforced by ARK-X.

Request bodies and downloads stream through unchanged. Upstream redirects
back into ARK-X are rewritten onto the incoming ATANDA hostname. Redirects to
external services remain external. Personalized responses are never cached.
Upstream failures produce a 503, never a legacy-app fallback.

## Build and publishing

`npm run build` syntax-checks and tests the Worker. Cloudflare's existing
GitHub integration bundles/deploys the Worker using the unchanged service name
`atanda-fe`. There is deliberately no legacy static-assets binding; otherwise
Cloudflare's SPA fallback could bypass the gateway and resurrect old accounts.
Keep the currently configured Cloudflare custom domains and Git deployment.
Do not add DNS routes, rename the connected service, or create another host.

`npm run dev` / `npm run cf:dev` runs Wrangler locally against the real ARK-X
origin. This uses real ARK-X accounts and data, not a sandbox.

The legacy Vite source remains for reference. `npm run dev:legacy` and
`npm run build:legacy` explicitly select it; it is not the production app.
An existing obfuscated `api.js` was found in the old build/dev commands. It
was not executed or deleted during integration, and has been removed from all
package-script execution paths. Review it separately before any manual use.

Tests: `npm run test:gateway`.

## Verification after the GitHub push

1. Wait for **Workers Builds: atanda-fe** to succeed for the new commit.
2. `https://atanda.ai/` must return `x-atanda-gateway: ark-x` and the ARK-X page.
3. `/api/health/migrations` must return JSON with `ok: true`,
   `managedBy: "publish"` and `checkoutReservationGuard: true`.
4. `/api/auth/me` without a session must remain 401. Sign in normally, confirm
   account persistence after refresh, then log out and confirm access is gone.
5. Check an authenticated upload, download and role-restricted feature with an
   authorized test account before declaring those journeys verified.

ARK-X's Stripe connection was unavailable at integration time. This gateway
does not repair payment credentials or promise a successful charge. Stripe
checkout return URLs currently come from the backend's canonical domain;
they must be aligned and verified before enabling payments on ATANDA.
The gateway cannot rewrite URLs stored inside a provider's checkout session.

## Rollback

Revert the integration commit through the same GitHub/Cloudflare pipeline.
That restores the previous interface; it does not migrate ARK-X data back.
Do not overwrite production databases or delete checkout history.

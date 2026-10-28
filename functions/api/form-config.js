import {TURNSTILE_SITE_KEY} from '../_lib/turnstile.js';
export function onRequestGet({env}) {
  const ready=Boolean(env.TURNSTILE_SECRET_KEY&&env.RESEND_API_KEY&&env.QUOTE_FROM&&env.QUOTE_TO);
  return Response.json({siteKey:TURNSTILE_SITE_KEY,ready},{headers:{'Cache-Control':'no-store'}});
}

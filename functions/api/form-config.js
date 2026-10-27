export function onRequestGet({env}) {
  if(!env.TURNSTILE_SITE_KEY||!env.TURNSTILE_SECRET_KEY||!env.RESEND_API_KEY||!env.QUOTE_FROM||!env.QUOTE_TO) return Response.json({message:'Form is not configured.'},{status:503,headers:{'Cache-Control':'no-store'}});
  return Response.json({siteKey:env.TURNSTILE_SITE_KEY},{headers:{'Cache-Control':'no-store'}});
}

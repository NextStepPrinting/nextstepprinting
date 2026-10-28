// Public widget identifier supplied by the owner. This is not the secret key.
export const TURNSTILE_SITE_KEY='0x4AAAAAAFo4dXCxF6ZlPYBa';

export function expectedHostnames(env){
  return new Set((env.TURNSTILE_HOSTNAMES||'nextstepprinting.pages.dev')
    .split(',').map(host=>host.trim().toLowerCase())
    .filter(host=>host&&host!=='localhost'&&host!=='127.0.0.1'));
}

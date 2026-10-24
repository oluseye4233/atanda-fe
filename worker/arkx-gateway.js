/**
 * ATANDA's Cloudflare entry point. ARK-X owns the UI, sessions and all APIs.
 * Keep the upstream fixed: never accept a target from headers or query strings.
 */
export const ARKX_ORIGIN = "https://arkatanda.replit.app";
const HOP_HEADERS = [
  "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
  "te", "trailer", "transfer-encoding",
];

function unavailable(request, status = 503) {
  const isApi = new URL(request.url).pathname.startsWith("/api/");
  const headers = {
    "content-type": isApi ? "application/json; charset=utf-8" : "text/html; charset=utf-8",
    "cache-control": "private, no-store",
    "cdn-cache-control": "no-store",
    "retry-after": "30",
    "x-atanda-gateway": "ark-x",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
  };
  const message = "ARK-X is temporarily unavailable. Please try again shortly.";
  const body = isApi
    ? JSON.stringify({ message })
    : `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATANDA — temporarily unavailable</title><h1>ATANDA</h1><p>${message}</p></html>`;
  return new Response(request.method === "HEAD" ? null : body, { status, headers });
}

function rewriteLocation(location, publicUrl) {
  if (!location) return location;
  try {
    const destination = new URL(location, ARKX_ORIGIN);
    if (destination.origin !== ARKX_ORIGIN) return location;
    // Assign path/query separately: a pathname beginning "//" cannot change host.
    const target = new URL(publicUrl.origin);
    target.pathname = destination.pathname;
    target.search = destination.search;
    target.hash = destination.hash;
    return target.href;
  } catch {
    return location;
  }
}

function responseHeaders(upstream, publicUrl) {
  const headers = new Headers(upstream.headers);
  // Never share personalized responses through an edge or browser cache.
  headers.set("cache-control", "private, no-store");
  headers.set("cdn-cache-control", "no-store");
  headers.set("cloudflare-cdn-cache-control", "no-store");
  headers.delete("age");
  headers.set("x-atanda-gateway", "ark-x");
  const location = rewriteLocation(headers.get("location"), publicUrl);
  if (location) headers.set("location", location);
  // ARK-X uses a host-only ark.sid cookie. Re-scope explicitly domain-bound
  // upstream cookies without combining multiple Set-Cookie header values.
  // Workers documents getAll("Set-Cookie"); Node uses getSetCookie().
  // Never split a combined cookie string: Expires attributes contain commas.
  const cookies = typeof upstream.headers.getSetCookie === "function"
    ? upstream.headers.getSetCookie()
    : upstream.headers.getAll("Set-Cookie");
  headers.delete("set-cookie");
  for (const cookie of cookies) {
    headers.append("set-cookie", cookie.replace(/;\s*Domain=[^;]*/ig, ""));
  }
  return headers;
}

export async function handleRequest(request, fetchUpstream = fetch) {
  const publicUrl = new URL(request.url);
  if (!["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(request.method)) {
    return new Response("Method not allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS", "cache-control": "no-store" },
    });
  }
  const target = new URL(ARKX_ORIGIN);
  target.pathname = publicUrl.pathname;
  target.search = publicUrl.search;

  const headers = new Headers(request.headers);
  const connectionHeaders = (headers.get("connection") || "").split(",").map(h => h.trim());
  for (const name of [...HOP_HEADERS, ...connectionHeaders]) if (name) headers.delete(name);
  headers.delete("host");
  headers.delete("forwarded");
  headers.delete("x-forwarded-for");
  headers.delete("x-real-ip");
  // Do not let a visitor inject public-link origins or the trusted client IP.
  headers.set("x-forwarded-host", publicUrl.host);
  headers.set("x-forwarded-proto", publicUrl.protocol.slice(0, -1));
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp) headers.set("x-forwarded-for", clientIp);

  try {
    const upstreamRequest = new Request(new Request(target, request), {
      headers,
      redirect: "manual",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(120_000)]),
    });
    const upstream = await fetchUpstream(upstreamRequest, {
      cf: { cacheEverything: false, cacheTtl: 0 },
    });
    if (upstream.status === 101) return upstream;
    // An upstream outage must not leak an infrastructure error page or run the
    // old account system. Preserve ordinary API errors such as 401/403/429.
    if (upstream.status >= 500) {
      await upstream.body?.cancel();
      return unavailable(request);
    }
    return new Response(request.method === "HEAD" ? null : upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders(upstream, publicUrl),
    });
  } catch {
    return unavailable(request);
  }
}

// Cloudflare passes (request, env, context); env must never become the injectable
// fetch function used by tests.
export default { fetch(request) { return handleRequest(request); } };

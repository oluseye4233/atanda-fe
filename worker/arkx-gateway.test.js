import test from "node:test";
import assert from "node:assert/strict";
import gateway, { ARKX_ORIGIN, handleRequest } from "./arkx-gateway.js";

const request = (path = "/", init = {}) => new Request(`https://atanda.ai${path}`, init);

test("Cloudflare's env/context arguments are not treated as a fetch function", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response("ARK-X"));
  const response = await gateway.fetch(request(), { ENVIRONMENT: "production" }, {});
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "ARK-X");
});

test("all UI, API and asset paths use only the fixed ARK-X origin", async () => {
  for (const path of ["/", "/dashboard", "/assets/app.js", "/api/auth/me", "//evil.example/api?target=https://evil.example", "/api/report?token=a%2Fb&x=1"]) {
    const incoming = request(path);
    let received;
    const response = await handleRequest(incoming, async (upstream, options) => {
      received = upstream;
      assert.equal(options.cf.cacheTtl, 0);
      return new Response("ARK-X", { headers: { "content-type": "text/plain" } });
    });
    const target = new URL(received.url);
    assert.equal(target.origin, ARKX_ORIGIN);
    assert.equal(target.pathname, new URL(incoming.url).pathname);
    assert.equal(target.search, new URL(incoming.url).search);
    assert.equal(await response.text(), "ARK-X");
    assert.equal(response.headers.get("x-atanda-gateway"), "ark-x");
  }
});

test("POST body, credentials, content type and Origin reach ARK-X unchanged", async () => {
  const body = JSON.stringify({ username: "fixture-user", password: "fixture-password" });
  const incoming = request("/api/auth/login", {
    method: "POST", body,
    headers: { "content-type": "application/json", cookie: "ark.sid=fixture", origin: "https://atanda.ai", authorization: "Bearer fixture" },
  });
  await handleRequest(incoming, async upstream => {
    assert.equal(upstream.method, "POST");
    assert.equal(await upstream.text(), body);
    assert.equal(upstream.headers.get("cookie"), "ark.sid=fixture");
    assert.equal(upstream.headers.get("authorization"), "Bearer fixture");
    assert.equal(upstream.headers.get("origin"), "https://atanda.ai");
    assert.equal(upstream.headers.get("content-type"), "application/json");
    assert.equal(upstream.redirect, "manual");
    return new Response("{}");
  });
});

test("multipart uploads are streamed without parsing or changing the boundary", async () => {
  const form = new FormData();
  form.append("resume", new Blob(["fixture resume"], { type: "text/plain" }), "resume.txt");
  const incoming = request("/api/resume/upload", { method: "POST", body: form });
  const contentType = incoming.headers.get("content-type");
  await handleRequest(incoming, async upstream => {
    assert.equal(upstream.headers.get("content-type"), contentType);
    const forwarded = await upstream.formData();
    assert.equal(await forwarded.get("resume").text(), "fixture resume");
    return new Response("{}");
  });
});

test("trusted forwarding headers replace visitor-supplied origins and IPs", async () => {
  await handleRequest(request("/", { headers: {
    host: "evil.example", forwarded: "host=evil.example",
    "x-forwarded-host": "evil.example", "x-forwarded-proto": "http",
    "x-forwarded-for": "spoofed", "x-real-ip": "spoofed",
    "cf-connecting-ip": "192.0.2.42",
  } }), async upstream => {
    assert.equal(upstream.headers.get("host"), null);
    assert.equal(upstream.headers.get("forwarded"), null);
    assert.equal(upstream.headers.get("x-real-ip"), null);
    assert.equal(upstream.headers.get("x-forwarded-host"), "atanda.ai");
    assert.equal(upstream.headers.get("x-forwarded-proto"), "https");
    assert.equal(upstream.headers.get("x-forwarded-for"), "192.0.2.42");
    return new Response("ok");
  });
});

test("separate session cookies keep expiry, Secure, HttpOnly and SameSite", async () => {
  const headers = new Headers();
  headers.append("set-cookie", "ark.sid=fixture; Domain=arkatanda.replit.app; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Wed, 21 Oct 2026 07:28:00 GMT");
  headers.append("set-cookie", "other=fixture; Path=/; Secure; SameSite=Lax");
  const response = await handleRequest(request("/api/auth/login"), async () => new Response("{}", { headers }));
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  assert.match(cookies[0], /HttpOnly; Secure; SameSite=Lax; Expires=Wed,/);
  assert.ok(cookies.every(cookie => !/Domain=/i.test(cookie)));
});

test("logout cookie clearing survives the gateway", async () => {
  const response = await handleRequest(request("/api/auth/logout", { method: "POST" }), async () => new Response("{}", {
    headers: { "set-cookie": "ark.sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax" },
  }));
  assert.match(response.headers.get("set-cookie"), /ark.sid=; Path=\/; Expires=Thu, 01 Jan 1970/);
});

test("Cloudflare's documented getAll cookie API preserves separate cookies", async () => {
  const upstream = new Response("{}");
  Object.defineProperty(upstream.headers, "getSetCookie", { value: undefined });
  Object.defineProperty(upstream.headers, "getAll", { value(name) {
    assert.equal(name, "Set-Cookie");
    return ["ark.sid=fixture; Secure; HttpOnly; SameSite=Lax", "second=fixture; Secure"];
  } });
  const response = await handleRequest(request("/api/auth/login"), async () => upstream);
  assert.equal(response.status, 200);
  assert.equal(response.headers.getSetCookie().length, 2);
});

test("upstream redirects stay at ATANDA; external checkout redirects stay external", async () => {
  for (const [location, expected] of [
    ["/login", "https://atanda.ai/login"],
    [`${ARKX_ORIGIN}/checkout/fixture?provider=success#status`, "https://atanda.ai/checkout/fixture?provider=success#status"],
    ["https://checkout.stripe.com/c/pay/fixture", "https://checkout.stripe.com/c/pay/fixture"],
    ["https://arkatanda.replit.app.evil.example/", "https://arkatanda.replit.app.evil.example/"],
  ]) {
    const response = await handleRequest(request(), async () => new Response(null, { status: 302, headers: { location } }));
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), expected);
  }
});

test("authorization errors and rate-limit responses remain errors, not SPA HTML", async () => {
  for (const status of [400, 401, 403, 404, 409, 429]) {
    const response = await handleRequest(request("/api/private"), async () => Response.json({ message: "Denied" }, {
      status, headers: { "retry-after": "60", "cache-control": "public, max-age=300" },
    }));
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { message: "Denied" });
    assert.equal(response.headers.get("retry-after"), "60");
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(response.headers.get("cloudflare-cdn-cache-control"), "no-store");
  }
});

test("outages fail explicitly without leaking upstream internals or old app HTML", async () => {
  for (const path of ["/", "/api/private"]) {
    for (const fetcher of [
      async () => { throw new Error("sensitive infrastructure detail"); },
      async () => new Response("sensitive infrastructure detail", { status: 502 }),
    ]) {
      const response = await handleRequest(request(path), fetcher);
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("retry-after"), "30");
      const body = await response.text();
      assert.match(body, /temporarily unavailable/);
      assert.ok(!body.includes("sensitive"));
      assert.ok(!body.includes("api.atanda.ai"));
    }
  }
});

test("HEAD stays bodyless and binary downloads retain bytes and disposition", async () => {
  const head = await handleRequest(request("/", { method: "HEAD" }), async () => new Response(null, { headers: { "content-type": "text/html" } }));
  assert.equal(await head.text(), "");
  const data = new Uint8Array([0, 1, 128, 255]);
  const download = await handleRequest(request("/api/report/pdf"), async () => new Response(data, {
    headers: { "content-type": "application/pdf", "content-disposition": 'attachment; filename="report.pdf"' },
  }));
  assert.deepEqual(new Uint8Array(await download.arrayBuffer()), data);
  assert.equal(download.headers.get("content-disposition"), 'attachment; filename="report.pdf"');
});

test("all supported write methods and OPTIONS preserve method and body", async () => {
  for (const method of ["PUT", "PATCH", "DELETE", "OPTIONS"]) {
    const incoming = request("/api/profile", { method, body: "fixture" });
    await handleRequest(incoming, async upstream => {
      assert.equal(upstream.method, method);
      assert.equal(await upstream.text(), "fixture");
      return new Response(null, { status: 204 });
    });
  }
});

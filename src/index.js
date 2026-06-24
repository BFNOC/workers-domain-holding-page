const IMAGE_PROXY_PATH = "/assets/proxy-image";
const IMAGE_PROXY_TTL_SECONDS = 60 * 60 * 6;
const LOCAL_CONFIG_PATH = "/site-config.local.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === LOCAL_CONFIG_PATH) {
      return handleOptionalLocalConfig(request, env);
    }

    if (url.pathname === IMAGE_PROXY_PATH) {
      return handleImageProxy(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleOptionalLocalConfig(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET, HEAD"
      }
    });
  }

  const asset = await env.ASSETS.fetch(stripSearch(request));
  const contentType = asset.headers.get("Content-Type") || "";

  if (asset.ok && /\b(?:java|ecma)script\b/i.test(contentType)) {
    return noStoreJavaScript(asset, request.method);
  }

  return new Response(request.method === "HEAD" ? null : "", {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/javascript; charset=utf-8"
    }
  });
}

function stripSearch(request) {
  const url = new URL(request.url);
  url.search = "";
  return new Request(url.toString(), request);
}

function noStoreJavaScript(response, method) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "application/javascript; charset=utf-8");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(method === "HEAD" ? null : response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function handleImageProxy(request, env, ctx) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        Allow: "GET, HEAD"
      }
    });
  }

  const imageSource = env.IMAGE_PROXY_SOURCE;
  if (!imageSource) {
    return new Response("Image proxy not configured", { status: 404 });
  }

  const cache = caches.default;
  const cacheKey = buildImageCacheKey(request);
  const cached = await cache.match(cacheKey);

  if (cached) {
    return addCacheStatus(cached, "HIT", request.method);
  }

  let upstream;
  try {
    upstream = await fetch(imageSource, {
      headers: {
        Accept: "image/*"
      },
      redirect: "follow"
    });
  } catch {
    return new Response("Image source unavailable", { status: 502 });
  }

  const contentType = upstream.headers.get("Content-Type") || "";
  if (!upstream.ok || !contentType.startsWith("image/")) {
    return new Response("Image source unavailable", { status: 502 });
  }

  const response = new Response(upstream.body, {
    status: 200,
    headers: buildImageHeaders(upstream.headers, contentType)
  });

  ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return addCacheStatus(response, "MISS", request.method);
}

function buildImageCacheKey(request) {
  const url = new URL(request.url);
  url.search = "";
  return new Request(url.toString(), { method: "GET" });
}

function buildImageHeaders(upstreamHeaders, contentType) {
  const headers = new Headers();
  const etag = upstreamHeaders.get("ETag");
  const lastModified = upstreamHeaders.get("Last-Modified");

  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", `public, max-age=${IMAGE_PROXY_TTL_SECONDS}`);
  headers.set("X-Content-Type-Options", "nosniff");

  if (etag) {
    headers.set("ETag", etag);
  }
  if (lastModified) {
    headers.set("Last-Modified", lastModified);
  }

  return headers;
}

function addCacheStatus(response, status, method) {
  const next = new Response(method === "HEAD" ? null : response.body, response);
  next.headers.set("X-Image-Proxy-Cache", status);
  return next;
}

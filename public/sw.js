/*
 * Court Ready service worker.
 *
 * Registered in production only (see components/pwa-register.tsx).
 *
 * Bump CACHE_VERSION on every release. A frozen cache name meant returning
 * users could hold stale assets forever.
 */
const CACHE_VERSION = "0.2.1"
const CACHE_NAME = `court-ready-${CACHE_VERSION}`

const APP_SHELL = ["/", "/manifest.webmanifest", "/icon.svg", "/icon-192.png"]

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin
}

/** Content-hashed build output: safe to serve from cache indefinitely. */
function isImmutableAsset(requestUrl) {
  return requestUrl.pathname.startsWith("/_next/static/")
}

function isNextInternal(requestUrl) {
  return (
    requestUrl.pathname.startsWith("/_next/") && !isImmutableAsset(requestUrl)
  )
}

async function putInCache(request, response) {
  if (!response || !response.ok || response.type === "opaque") {
    return
  }

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    await putInCache(request, response)

    return response
  } catch {
    const cached = await caches.match(request)

    if (cached) {
      return cached
    }

    const shell = await caches.match("/")

    return (
      shell ||
      new Response("You are offline and this page is not cached yet.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      })
    )
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    await putInCache(request, response)

    return response
  } catch {
    // Never let respondWith reject: that surfaces as a hard network error.
    return new Response("", { status: 504 })
  }
}

/** Serve immediately, refresh in the background. */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)

  const network = fetch(request)
    .then(async (response) => {
      await putInCache(request, response)
      return response
    })
    .catch(() => null)

  if (cached) {
    return cached
  }

  const response = await network

  return response || new Response("", { status: 504 })
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("court-ready-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (!isSameOrigin(requestUrl) || isNextInternal(requestUrl)) {
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request))
    return
  }

  if (isImmutableAsset(requestUrl)) {
    event.respondWith(cacheFirst(event.request))
    return
  }

  event.respondWith(staleWhileRevalidate(event.request))
})

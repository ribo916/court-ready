const CACHE_NAME = "court-ready-v1"
const APP_SHELL = ["/", "/manifest.webmanifest", "/icon.svg"]

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin
}

function isNextAsset(requestUrl) {
  return requestUrl.pathname.startsWith("/_next/")
}

function cacheResponse(request, response) {
  if (!response || !response.ok) {
    return response
  }

  const responseClone = response.clone()
  caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))

  return response
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    return cacheResponse(request, response)
  } catch {
    const cachedResponse = await caches.match(request)
    return cachedResponse || caches.match("/")
  }
}

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(request)
  return cacheResponse(request, response)
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const requestUrl = new URL(event.request.url)

  if (!isSameOrigin(requestUrl) || isNextAsset(requestUrl)) {
    return
  }

  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(event.request))
    return
  }

  event.respondWith(cacheFirst(event.request))
})

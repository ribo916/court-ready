"use client"

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )

      window.caches
        ?.keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((key) => key.startsWith("court-ready-"))
              .map((key) => window.caches.delete(key))
          )
        )

      return
    }

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    })
  }, [])

  return null
}

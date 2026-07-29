/**
 * Choosing how to hand a backup to the operating system.
 *
 * WebKit only allows a restricted set of file types through the Web Share API,
 * and `application/json` is not reliably among them. When it is rejected,
 * `navigator.canShare` returns false and an installed iOS app silently falls
 * through to an `<a download>` that standalone mode ignores, leaving the export
 * button doing nothing at all.
 *
 * So try progressively plainer shapes and report which one was chosen. All the
 * probing uses `canShare`, which is synchronous and does not consume the user
 * gesture, so the single real `share()` call still happens inside the click.
 */

export type ShareStrategy = "json-file" | "text-file" | "text" | null

export type SharePlan = {
  strategy: ShareStrategy
  data: ShareData | null
}

type CanShare = (data: ShareData) => boolean

export function buildBackupFilename(date: string, extension: "json" | "txt") {
  return `court-ready-${date}.${extension}`
}

export function planShare(
  json: string,
  date: string,
  canShare?: CanShare
): SharePlan {
  if (!canShare) {
    return { strategy: null, data: null }
  }

  const title = "Court Ready backup"

  const jsonFile = new File([json], buildBackupFilename(date, "json"), {
    type: "application/json",
  })

  if (canShare({ files: [jsonFile] })) {
    return { strategy: "json-file", data: { files: [jsonFile], title } }
  }

  // Same bytes, a type WebKit is far more willing to accept.
  const textFile = new File([json], buildBackupFilename(date, "txt"), {
    type: "text/plain",
  })

  if (canShare({ files: [textFile] })) {
    return { strategy: "text-file", data: { files: [textFile], title } }
  }

  // Last shareable shape: the raw JSON as text, for Notes or Mail.
  if (canShare({ text: json })) {
    return { strategy: "text", data: { text: json, title } }
  }

  return { strategy: null, data: null }
}

/**
 * An installed app cannot rely on `<a download>`; standalone mode drops it
 * without error. Knowing this lets the UI avoid claiming a download happened.
 */
export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  const iosStandalone = (
    window.navigator as Navigator & { standalone?: boolean }
  ).standalone

  return (
    iosStandalone === true ||
    window.matchMedia?.("(display-mode: standalone)")?.matches === true
  )
}

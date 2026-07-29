"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import { ClipboardCopy, Download, Upload } from "lucide-react"

import { Card, CardHeading } from "@/components/dashboard/card"
import { Button } from "@/components/ui/button"
import type { DateKey } from "@/lib/date"
import {
  buildBackupFilename,
  isStandaloneDisplay,
  planShare,
} from "@/lib/share"
import {
  countStoredDays,
  exportData,
  importData,
  markExported,
  readMeta,
  shouldNudgeBackup,
  subscribeToStorage,
} from "@/lib/storage"

/**
 * Local storage is the only copy of this data and it lives on one device, so a
 * manual backup is the safety net for the whole product.
 */
export function DataCard({ today }: { today: DateKey }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  // A boolean snapshot compares by value, so this stays stable across renders.
  const needsBackup = useSyncExternalStore(
    subscribeToStorage,
    () => shouldNudgeBackup(today, readMeta(), countStoredDays()),
    () => false
  )

  function fallbackToDownload(json: string, filename: string) {
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()

    // Revoking immediately can cancel the download before the blob is read.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  async function copyToClipboard(json: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(json)
      return true
    } catch {
      return false
    }
  }

  /**
   * Export must never be a no-op. Share the file if the platform will take it,
   * fall back to plainer share shapes, then to a download, and on an installed
   * app where downloads are swallowed, put the backup on the clipboard rather
   * than claiming success.
   */
  async function handleExport() {
    const json = exportData()
    const plan = planShare(
      json,
      today,
      navigator.canShare?.bind(navigator)
    )

    if (plan.data) {
      try {
        await navigator.share(plan.data)
        markExported(today)
        setStatus(
          plan.strategy === "text"
            ? "Shared as text. Paste it somewhere off this phone."
            : "Shared. Save it to Files or iCloud Drive, not just this phone."
        )
        return
      } catch (error) {
        // Cancelling the sheet is not a failure worth reporting.
        if ((error as Error)?.name === "AbortError") {
          return
        }
      }
    }

    if (isStandaloneDisplay()) {
      const copied = await copyToClipboard(json)

      if (copied) {
        markExported(today)
        setStatus(
          "Your phone would not share the file, so the backup is on your clipboard. Paste it into Notes or an email."
        )
      } else {
        setStatus("Could not export here. Open the app in Safari and try again.")
      }

      return
    }

    fallbackToDownload(json, buildBackupFilename(today, "json"))
    markExported(today)
    setStatus("Backup downloaded.")
  }

  async function handleCopy() {
    if (await copyToClipboard(exportData())) {
      markExported(today)
      setStatus("Copied. Paste it into Notes or an email to yourself.")
      return
    }

    setStatus("Could not copy. Try Export instead.")
  }

  async function handleImport(file: File) {
    const confirmed = window.confirm(
      "Restoring replaces any day that appears in the backup file. Continue?"
    )

    if (!confirmed) {
      return
    }

    const result = importData(await file.text())

    if (result.error) {
      setStatus(result.error)
      return
    }

    const skipped = result.skipped > 0 ? `, ${result.skipped} skipped` : ""
    setStatus(`Restored ${result.imported} days${skipped}.`)
  }

  return (
    <Card>
      <CardHeading eyebrow="Your data" title="Backup" />
      <p className="mt-2 text-sm leading-6 text-ink-subtle">
        Everything lives on this device only. Deleting the app from your home
        screen, or clearing website data, takes your history with it.
      </p>

      {needsBackup ? (
        <p className="mt-3 rounded-lg border border-recover bg-recover-soft px-3 py-2 text-sm leading-6 text-recover-ink">
          You have history that is not backed up anywhere. Export it and save it
          off this phone.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="lg" onClick={handleExport}>
          <Download aria-hidden="true" />
          Export
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          Restore
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={handleCopy}>
          <ClipboardCopy aria-hidden="true" />
          Copy
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          // iOS maps JSON to inconsistent UTIs, so keep the filter permissive
          // or the picker greys out the very file it just wrote.
          // The share path may hand iOS a .txt, so restore must accept it back.
          accept=".json,.txt,application/json,text/plain"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) {
              void handleImport(file)
            }

            event.target.value = ""
          }}
        />
      </div>

      <p
        className="mt-3 min-h-5 text-sm text-ink-muted"
        role="status"
        aria-live="polite"
      >
        {status}
      </p>
    </Card>
  )
}

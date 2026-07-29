"use client"

import { useRef, useState } from "react"
import { Download, Upload } from "lucide-react"

import { Card, CardHeading } from "@/components/dashboard/card"
import { Button } from "@/components/ui/button"
import type { DateKey } from "@/lib/date"
import { exportData, importData } from "@/lib/storage"

/**
 * Local storage is the only copy of this data and browsers can evict it, so a
 * manual backup is the safety net for the whole product.
 */
export function DataCard({ today }: { today: DateKey }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)

  function handleExport() {
    const blob = new Blob([exportData()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `court-ready-${today}.json`
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    setStatus("Backup downloaded.")
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
        Everything lives on this device. Export now and then so a cleared
        browser cannot take your history with it.
      </p>

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
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
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

      <p className="mt-3 min-h-5 text-sm text-ink-muted" role="status" aria-live="polite">
        {status}
      </p>
    </Card>
  )
}

"use client"

import { NotebookPen } from "lucide-react"

import { Card } from "@/components/dashboard/card"

type NoteCardProps = {
  value: string
  onChange: (value: string) => void
}

export function NoteCard({ value, onChange }: NoteCardProps) {
  return (
    <Card>
      <label htmlFor="daily-note" className="flex items-center gap-2">
        <NotebookPen className="size-5 text-brand" aria-hidden="true" />
        <span className="text-sm font-medium text-ink-muted">Daily note</span>
      </label>
      <textarea
        id="daily-note"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        placeholder="One thing that helped today..."
        className="mt-3 min-h-28 w-full resize-none rounded-lg border border-hairline bg-inset px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink-faint focus:border-brand focus:ring-3 focus:ring-brand/20"
      />
    </Card>
  )
}

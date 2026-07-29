import { describe, expect, it } from "vitest"

import { buildBackupFilename, planShare } from "@/lib/share"

const json = '{"app":"court-ready","days":[]}'
const date = "2026-07-28"

/** Mimics WebKit, which accepts some file types for sharing and rejects others. */
function canShareAllowing(allowedTypes: string[], allowText = true) {
  return (data: ShareData) => {
    if (data.files?.length) {
      return data.files.every((file) => allowedTypes.includes(file.type))
    }

    return allowText && typeof data.text === "string"
  }
}

describe("buildBackupFilename", () => {
  it("stamps the date and extension", () => {
    expect(buildBackupFilename(date, "json")).toBe("court-ready-2026-07-28.json")
    expect(buildBackupFilename(date, "txt")).toBe("court-ready-2026-07-28.txt")
  })
})

describe("planShare", () => {
  it("prefers a real JSON file when the platform accepts one", () => {
    const plan = planShare(json, date, canShareAllowing(["application/json"]))

    expect(plan.strategy).toBe("json-file")
    expect(plan.data?.files?.[0].name).toBe("court-ready-2026-07-28.json")
    expect(plan.data?.files?.[0].type).toBe("application/json")
  })

  it("falls back to a text file when JSON is rejected", () => {
    // This is the observed iOS behaviour: application/json is not shareable.
    const plan = planShare(json, date, canShareAllowing(["text/plain"]))

    expect(plan.strategy).toBe("text-file")
    expect(plan.data?.files?.[0].name).toBe("court-ready-2026-07-28.txt")
    expect(plan.data?.files?.[0].type).toBe("text/plain")
  })

  it("falls back to plain text when no file type is accepted", () => {
    const plan = planShare(json, date, canShareAllowing([]))

    expect(plan.strategy).toBe("text")
    expect(plan.data?.text).toBe(json)
    expect(plan.data?.files).toBeUndefined()
  })

  it("reports no plan when nothing can be shared", () => {
    const plan = planShare(json, date, canShareAllowing([], false))

    expect(plan.strategy).toBeNull()
    expect(plan.data).toBeNull()
  })

  it("reports no plan when the platform has no share support at all", () => {
    const plan = planShare(json, date, undefined)

    expect(plan.strategy).toBeNull()
    expect(plan.data).toBeNull()
  })

  it("preserves the backup contents through every strategy", async () => {
    const cases = [
      canShareAllowing(["application/json"]),
      canShareAllowing(["text/plain"]),
    ]

    for (const canShare of cases) {
      const plan = planShare(json, date, canShare)
      const file = plan.data?.files?.[0]

      expect(file).toBeDefined()
      expect(await file!.text()).toBe(json)
    }

    expect(planShare(json, date, canShareAllowing([])).data?.text).toBe(json)
  })

  it("only ever probes, never shares, so the user gesture survives", () => {
    const seen: ShareData[] = []
    planShare(json, date, (data) => {
      seen.push(data)
      return false
    })

    // Three probes: json file, text file, text. No share() call is made here.
    expect(seen).toHaveLength(3)
  })
})

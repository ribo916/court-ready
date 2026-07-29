import { beforeEach, describe, expect, it } from "vitest"

import { shiftDateKey } from "@/lib/date"
import {
  backupNudgeDays,
  countStoredDays,
  createEmptyRecord,
  exportData,
  markExported,
  readMeta,
  shouldNudgeBackup,
  importData,
  isEmptyRecord,
  migrateLegacyRecords,
  parseDayRecord,
  pruneOldRecords,
  readDayRecord,
  readHistory,
  schemaVersion,
  subscribeToStorage,
  writeDayRecord,
  type StorageLike,
} from "@/lib/storage"

function fakeStorage(): StorageLike {
  const map = new Map<string, string>()

  return {
    get length() {
      return map.size
    },
    key: (index: number) => [...map.keys()][index] ?? null,
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value)
    },
    removeItem: (key: string) => {
      map.delete(key)
    },
  }
}

const today = "2026-07-28"
let storage: StorageLike

beforeEach(() => {
  storage = fakeStorage()
})

describe("parseDayRecord", () => {
  it("returns an empty record for junk", () => {
    for (const junk of [null, undefined, 42, "text", [], true]) {
      expect(parseDayRecord(junk, today)).toEqual(createEmptyRecord(today))
    }
  })

  it("fills in missing fields", () => {
    const record = parseDayRecord({ water: 3 }, today)

    expect(record.water).toBe(3)
    expect(record.protein).toBe(0)
    expect(record.notes).toBe("")
    expect(record.checkIn).toBeNull()
    expect(record.version).toBe(schemaVersion)
  })

  it("clamps out-of-range and non-finite intake values", () => {
    expect(parseDayRecord({ water: -5 }, today).water).toBe(0)
    expect(parseDayRecord({ water: 9999 }, today).water).toBe(20)
    expect(parseDayRecord({ protein: -1 }, today).protein).toBe(0)
    expect(parseDayRecord({ protein: 99999 }, today).protein).toBe(300)
  })

  it("treats non-finite numbers as missing rather than as a huge value", () => {
    // NaN and Infinity are corruption, not a reading. Clamping Infinity to the
    // ceiling would silently invent a full day of protein.
    expect(parseDayRecord({ water: Number.NaN }, today).water).toBe(0)
    expect(
      parseDayRecord({ protein: Number.POSITIVE_INFINITY }, today).protein
    ).toBe(0)
    expect(
      parseDayRecord({ water: Number.NEGATIVE_INFINITY }, today).water
    ).toBe(0)
  })

  it("keeps only true entries in completedItems", () => {
    const record = parseDayRecord(
      { completedItems: { a: true, b: false, c: "yes", d: 1 } },
      today
    )

    expect(record.completedItems).toEqual({ a: true })
  })

  it("rejects a malformed check-in rather than trusting it", () => {
    expect(parseDayRecord({ checkIn: { sleep: 5 } }, today).checkIn).toBeNull()
    expect(parseDayRecord({ checkIn: "good" }, today).checkIn).toBeNull()
    expect(
      parseDayRecord({ checkIn: { sleep: 1, soreness: 2 } }, today).checkIn
    ).toBeNull()
  })

  it("accepts a well-formed check-in", () => {
    const record = parseDayRecord(
      { checkIn: { sleep: 1, soreness: 2, energy: 3, playedYesterday: true } },
      today
    )

    expect(record.checkIn).toEqual({
      sleep: 1,
      soreness: 2,
      energy: 3,
      playedYesterday: true,
    })
  })

  it("falls back to the requested date when the stored date is invalid", () => {
    expect(parseDayRecord({ date: "nonsense" }, today).date).toBe(today)
    expect(parseDayRecord({ date: "2026-01-01" }, today).date).toBe("2026-01-01")
  })
})

describe("isEmptyRecord", () => {
  it("treats a record with only false flags as empty", () => {
    const record = { ...createEmptyRecord(today), completedItems: { a: false } }

    expect(isEmptyRecord(record)).toBe(true)
  })

  it("treats whitespace-only notes as empty", () => {
    expect(isEmptyRecord({ ...createEmptyRecord(today), notes: "   " })).toBe(true)
  })

  it("detects any real content", () => {
    expect(isEmptyRecord({ ...createEmptyRecord(today), water: 1 })).toBe(false)
    expect(
      isEmptyRecord({
        ...createEmptyRecord(today),
        completedItems: { a: true },
      })
    ).toBe(false)
  })
})

describe("read and write", () => {
  it("round-trips a record", () => {
    const record = { ...createEmptyRecord(today), water: 4, notes: "good day" }
    writeDayRecord(record, storage)

    expect(readDayRecord(today, storage)).toEqual(record)
  })

  it("returns an empty record for a day that was never written", () => {
    expect(readDayRecord("2020-01-01", storage)).toEqual(
      createEmptyRecord("2020-01-01")
    )
  })

  it("survives corrupted JSON in storage", () => {
    storage.setItem(`court-ready:v2:day:${today}`, "{not json")

    expect(readDayRecord(today, storage)).toEqual(createEmptyRecord(today))
  })

  it("notifies subscribers on write", () => {
    let calls = 0
    const unsubscribe = subscribeToStorage(() => {
      calls += 1
    })

    writeDayRecord(createEmptyRecord(today), storage)
    expect(calls).toBe(1)

    unsubscribe()
    writeDayRecord(createEmptyRecord(today), storage)
    expect(calls).toBe(1)
  })
})

describe("readHistory", () => {
  it("returns the window oldest first, ending on the given day", () => {
    const history = readHistory(today, 7, storage)

    expect(history).toHaveLength(7)
    expect(history[0].date).toBe("2026-07-22")
    expect(history[6].date).toBe(today)
  })

  it("fills gaps with empty records", () => {
    writeDayRecord({ ...createEmptyRecord(today), water: 5 }, storage)
    const history = readHistory(today, 3, storage)

    expect(history.map((record) => record.water)).toEqual([0, 0, 5])
  })
})

describe("migrateLegacyRecords", () => {
  it("converts 0.1 records and removes the originals", () => {
    storage.setItem(
      "court-ready-dashboard-v1:2026-07-27",
      JSON.stringify({ completedItems: { "morning-water": true }, water: 6, protein: 90, notes: "hi" })
    )

    expect(migrateLegacyRecords(storage)).toBe(1)

    const migrated = readDayRecord("2026-07-27", storage)
    expect(migrated.water).toBe(6)
    expect(migrated.protein).toBe(90)
    expect(migrated.notes).toBe("hi")
    expect(migrated.completedItems).toEqual({ "morning-water": true })
    expect(migrated.version).toBe(schemaVersion)
    expect(storage.getItem("court-ready-dashboard-v1:2026-07-27")).toBeNull()
  })

  it("never overwrites an existing current-schema record", () => {
    writeDayRecord({ ...createEmptyRecord("2026-07-27"), water: 2 }, storage)
    storage.setItem(
      "court-ready-dashboard-v1:2026-07-27",
      JSON.stringify({ water: 8 })
    )

    migrateLegacyRecords(storage)

    expect(readDayRecord("2026-07-27", storage).water).toBe(2)
    expect(storage.getItem("court-ready-dashboard-v1:2026-07-27")).toBeNull()
  })

  it("discards legacy keys with an unusable date", () => {
    storage.setItem("court-ready-dashboard-v1:garbage", JSON.stringify({ water: 1 }))

    expect(migrateLegacyRecords(storage)).toBe(0)
    expect(storage.getItem("court-ready-dashboard-v1:garbage")).toBeNull()
  })

  it("is safe to run twice", () => {
    storage.setItem(
      "court-ready-dashboard-v1:2026-07-27",
      JSON.stringify({ water: 6 })
    )

    expect(migrateLegacyRecords(storage)).toBe(1)
    expect(migrateLegacyRecords(storage)).toBe(0)
    expect(readDayRecord("2026-07-27", storage).water).toBe(6)
  })
})

describe("pruneOldRecords", () => {
  it("keeps recent days", () => {
    writeDayRecord({ ...createEmptyRecord("2026-07-27"), water: 3 }, storage)

    expect(pruneOldRecords(today, storage)).toBe(0)
    expect(readDayRecord("2026-07-27", storage).water).toBe(3)
  })

  it("drops stale empty days but keeps stale days with content", () => {
    writeDayRecord(createEmptyRecord("2026-07-01"), storage)
    writeDayRecord({ ...createEmptyRecord("2026-07-02"), notes: "sore" }, storage)

    expect(pruneOldRecords(today, storage)).toBe(1)
    expect(readDayRecord("2026-07-02", storage).notes).toBe("sore")
  })

  it("drops days beyond the retention window even when they have content", () => {
    writeDayRecord({ ...createEmptyRecord("2024-01-01"), water: 8 }, storage)

    expect(pruneOldRecords(today, storage)).toBe(1)
    expect(readDayRecord("2024-01-01", storage).water).toBe(0)
  })

  it("never removes future-dated records", () => {
    writeDayRecord({ ...createEmptyRecord("2027-01-01"), water: 1 }, storage)

    expect(pruneOldRecords(today, storage)).toBe(0)
  })
})

describe("backup reminders", () => {
  it("starts with no recorded export", () => {
    expect(readMeta(storage).lastExportedAt).toBeNull()
  })

  it("round-trips the last export date", () => {
    markExported(today, storage)

    expect(readMeta(storage).lastExportedAt).toBe(today)
  })

  it("ignores a corrupt meta entry", () => {
    storage.setItem("court-ready:v2:meta", "{not json")
    expect(readMeta(storage).lastExportedAt).toBeNull()

    storage.setItem("court-ready:v2:meta", JSON.stringify({ lastExportedAt: 42 }))
    expect(readMeta(storage).lastExportedAt).toBeNull()
  })

  it("counts stored days without parsing them", () => {
    expect(countStoredDays(storage)).toBe(0)

    writeDayRecord({ ...createEmptyRecord("2026-07-26"), water: 1 }, storage)
    writeDayRecord({ ...createEmptyRecord(today), water: 1 }, storage)

    expect(countStoredDays(storage)).toBe(2)
  })

  it("stays quiet before there is anything to lose", () => {
    expect(shouldNudgeBackup(today, { lastExportedAt: null }, 0)).toBe(false)
    expect(shouldNudgeBackup(today, { lastExportedAt: null }, 2)).toBe(false)
  })

  it("asks once a few days of history exist and nothing was ever exported", () => {
    expect(shouldNudgeBackup(today, { lastExportedAt: null }, 3)).toBe(true)
  })

  it("goes quiet right after an export", () => {
    expect(shouldNudgeBackup(today, { lastExportedAt: today }, 30)).toBe(false)
  })

  it("asks again once the backup goes stale", () => {
    const dayBefore = shiftDateKey(today, -(backupNudgeDays - 1))
    const onThreshold = shiftDateKey(today, -backupNudgeDays)

    expect(shouldNudgeBackup(today, { lastExportedAt: dayBefore }, 30)).toBe(false)
    expect(shouldNudgeBackup(today, { lastExportedAt: onThreshold }, 30)).toBe(true)
  })
})

describe("export and import", () => {
  it("round-trips through a backup file", () => {
    writeDayRecord({ ...createEmptyRecord("2026-07-26"), water: 5 }, storage)
    writeDayRecord({ ...createEmptyRecord(today), protein: 120, notes: "ok" }, storage)

    const backup = exportData(storage)
    const restored = fakeStorage()
    const result = importData(backup, restored)

    expect(result.error).toBeNull()
    expect(result.imported).toBe(2)
    expect(readDayRecord("2026-07-26", restored).water).toBe(5)
    expect(readDayRecord(today, restored).protein).toBe(120)
    expect(readDayRecord(today, restored).notes).toBe("ok")
  })

  it("omits empty days from the backup", () => {
    writeDayRecord(createEmptyRecord("2026-07-26"), storage)
    writeDayRecord({ ...createEmptyRecord(today), water: 1 }, storage)

    const payload = JSON.parse(exportData(storage))

    expect(payload.days).toHaveLength(1)
    expect(payload.app).toBe("court-ready")
    expect(payload.schema).toBe(schemaVersion)
  })

  it("reports a readable error for junk input", () => {
    expect(importData("{not json", storage).error).toMatch(/valid JSON/i)
    expect(importData(JSON.stringify({ hello: 1 }), storage).error).toMatch(
      /no Court Ready days/i
    )
  })

  it("skips malformed entries instead of failing the whole import", () => {
    const json = JSON.stringify({
      days: [
        { date: "2026-07-26", water: 4 },
        { date: "not-a-date", water: 4 },
        { date: "2026-07-25" },
        "garbage",
      ],
    })

    const result = importData(json, storage)

    expect(result.imported).toBe(1)
    expect(result.skipped).toBe(3)
    expect(readDayRecord("2026-07-26", storage).water).toBe(4)
  })

  it("sanitises imported values rather than trusting the file", () => {
    const json = JSON.stringify({
      days: [{ date: "2026-07-26", water: 9999, completedItems: { a: "yes" } }],
    })

    importData(json, storage)

    const record = readDayRecord("2026-07-26", storage)
    expect(record.water).toBe(20)
    expect(record.completedItems).toEqual({})
  })
})

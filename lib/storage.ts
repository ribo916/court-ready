import { daysBetweenDateKeys, isDateKey, shiftDateKey, type DateKey } from "@/lib/date"
import type { CheckIn, CheckInScore, DayRecord } from "@/types/dashboard"

export const schemaVersion = 2

const dayKeyPrefix = "court-ready:v2:day:"
const legacyKeyPrefix = "court-ready-dashboard-v1:"
const metaKey = "court-ready:v2:meta"

/** Days of unbacked-up history before the backup card starts asking. */
export const backupNudgeDays = 14

/** Roughly thirteen months of history, which is all the app ever reads back. */
const retentionDays = 400
/** Empty days older than this are dropped so storage does not fill with noise. */
const emptyRetentionDays = 3

export const waterCeiling = 20
export const proteinCeiling = 300

export type StorageLike = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem" | "key" | "length"
>

function defaultStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch {
    // Safari throws on localStorage access when site data is blocked.
    return null
  }
}

export function createEmptyRecord(date: DateKey): DayRecord {
  return {
    version: schemaVersion,
    date,
    completedItems: {},
    water: 0,
    protein: 0,
    notes: "",
    checkIn: null,
  }
}

export function isEmptyRecord(record: DayRecord): boolean {
  return (
    record.water === 0 &&
    record.protein === 0 &&
    record.notes.trim() === "" &&
    record.checkIn === null &&
    Object.values(record.completedItems).every((value) => !value)
  )
}

export function clampWater(value: number): number {
  return Math.max(0, Math.min(waterCeiling, Math.round(value)))
}

export function clampProtein(value: number): number {
  return Math.max(0, Math.min(proteinCeiling, Math.round(value)))
}

function parseScore(value: unknown): CheckInScore | null {
  return value === 1 || value === 2 || value === 3 ? value : null
}

function parseCheckIn(value: unknown): CheckIn | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const candidate = value as Record<string, unknown>
  const sleep = parseScore(candidate.sleep)
  const soreness = parseScore(candidate.soreness)
  const energy = parseScore(candidate.energy)

  if (sleep === null || soreness === null || energy === null) {
    return null
  }

  return {
    sleep,
    soreness,
    energy,
    playedYesterday: candidate.playedYesterday === true,
  }
}

function parseCompletedItems(value: unknown): Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const result: Record<string, boolean> = {}

  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === true) {
      result[key] = true
    }
  }

  return result
}

/**
 * Tolerant of anything: partial records, older schemas, and outright garbage
 * all resolve to a usable record rather than throwing.
 */
export function parseDayRecord(value: unknown, date: DateKey): DayRecord {
  if (!value || typeof value !== "object") {
    return createEmptyRecord(date)
  }

  const candidate = value as Record<string, unknown>
  const storedDate = candidate.date

  return {
    version: schemaVersion,
    date: isDateKey(storedDate) ? storedDate : date,
    completedItems: parseCompletedItems(candidate.completedItems),
    water: clampWater(
      typeof candidate.water === "number" && Number.isFinite(candidate.water)
        ? candidate.water
        : 0
    ),
    protein: clampProtein(
      typeof candidate.protein === "number" && Number.isFinite(candidate.protein)
        ? candidate.protein
        : 0
    ),
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
    checkIn: parseCheckIn(candidate.checkIn),
  }
}

function parseJson(raw: string | null): unknown {
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// --- Change notification -----------------------------------------------------

const listeners = new Set<() => void>()

/** Bumped on every write so `useSyncExternalStore` has a stable snapshot. */
let revision = 0

export function subscribeToStorage(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export function getStorageRevision(): number {
  return revision
}

/**
 * `useSyncExternalStore` calls its snapshot getter on every render and compares
 * the result by reference, so reads must return the same object until storage
 * actually changes. These caches provide that stability and are dropped whole
 * on any write.
 */
const dayRecordSnapshots = new Map<DateKey, DayRecord>()
const historySnapshots = new Map<string, DayRecord[]>()

export function getDayRecordSnapshot(date: DateKey): DayRecord {
  const cached = dayRecordSnapshots.get(date)

  if (cached) {
    return cached
  }

  const record = readDayRecord(date)
  dayRecordSnapshots.set(date, record)

  return record
}

export function getHistorySnapshot(
  endDate: DateKey,
  days: number
): DayRecord[] {
  const key = `${endDate}:${days}`
  const cached = historySnapshots.get(key)

  if (cached) {
    return cached
  }

  const records = readHistory(endDate, days)
  historySnapshots.set(key, records)

  return records
}

function notify() {
  revision += 1
  dayRecordSnapshots.clear()
  historySnapshots.clear()

  for (const listener of listeners) {
    listener()
  }
}

// --- Reads and writes --------------------------------------------------------

export function readDayRecord(
  date: DateKey,
  storage: StorageLike | null = defaultStorage()
): DayRecord {
  if (!storage) {
    return createEmptyRecord(date)
  }

  return parseDayRecord(parseJson(storage.getItem(dayKeyPrefix + date)), date)
}

export function writeDayRecord(
  record: DayRecord,
  storage: StorageLike | null = defaultStorage()
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(dayKeyPrefix + record.date, JSON.stringify(record))
  } catch {
    // Quota or private-mode failures must not break the interaction.
    return
  }

  notify()
}

function storedDateKeys(storage: StorageLike): DateKey[] {
  const keys: DateKey[] = []

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)

    if (key?.startsWith(dayKeyPrefix)) {
      const date = key.slice(dayKeyPrefix.length)

      if (isDateKey(date)) {
        keys.push(date)
      }
    }
  }

  return keys.sort()
}

/** Records for the `days` calendar days ending at `endDate`, oldest first. */
export function readHistory(
  endDate: DateKey,
  days: number,
  storage: StorageLike | null = defaultStorage()
): DayRecord[] {
  const window: DayRecord[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = shiftDateKey(endDate, -offset)
    window.push(readDayRecord(date, storage))
  }

  return window
}

export function readAllRecords(
  storage: StorageLike | null = defaultStorage()
): DayRecord[] {
  if (!storage) {
    return []
  }

  return storedDateKeys(storage).map((date) => readDayRecord(date, storage))
}

// --- Migration and pruning ---------------------------------------------------

/**
 * Converts 0.1 records (`court-ready-dashboard-v1:<date>`) to the current
 * schema and removes the originals. Safe to run on every load.
 */
export function migrateLegacyRecords(
  storage: StorageLike | null = defaultStorage()
): number {
  if (!storage) {
    return 0
  }

  const legacyKeys: string[] = []

  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)

    if (key?.startsWith(legacyKeyPrefix)) {
      legacyKeys.push(key)
    }
  }

  let migrated = 0

  for (const key of legacyKeys) {
    const date = key.slice(legacyKeyPrefix.length)

    if (!isDateKey(date)) {
      storage.removeItem(key)
      continue
    }

    const legacyRecord = parseDayRecord(parseJson(storage.getItem(key)), date)
    const existing = storage.getItem(dayKeyPrefix + date)

    if (!existing) {
      try {
        storage.setItem(dayKeyPrefix + date, JSON.stringify(legacyRecord))
        migrated += 1
      } catch {
        continue
      }
    }

    storage.removeItem(key)
  }

  if (migrated > 0) {
    notify()
  }

  return migrated
}

export function pruneOldRecords(
  today: DateKey,
  storage: StorageLike | null = defaultStorage()
): number {
  if (!storage) {
    return 0
  }

  let removed = 0

  for (const date of storedDateKeys(storage)) {
    const age = daysBetweenDateKeys(date, today)

    if (age < 0) {
      continue
    }

    const isExpired = age > retentionDays
    const isStaleAndEmpty =
      age > emptyRetentionDays && isEmptyRecord(readDayRecord(date, storage))

    if (isExpired || isStaleAndEmpty) {
      storage.removeItem(dayKeyPrefix + date)
      removed += 1
    }
  }

  return removed
}

// --- Export and import -------------------------------------------------------

export type ExportPayload = {
  app: "court-ready"
  schema: number
  exportedAt: string
  days: DayRecord[]
}

export function buildExportPayload(records: DayRecord[]): ExportPayload {
  return {
    app: "court-ready",
    schema: schemaVersion,
    exportedAt: new Date().toISOString(),
    days: records.filter((record) => !isEmptyRecord(record)),
  }
}

export function exportData(
  storage: StorageLike | null = defaultStorage()
): string {
  return JSON.stringify(buildExportPayload(readAllRecords(storage)), null, 2)
}

// --- Backup reminders --------------------------------------------------------

export type AppMeta = {
  lastExportedAt: DateKey | null
}

export function readMeta(
  storage: StorageLike | null = defaultStorage()
): AppMeta {
  if (!storage) {
    return { lastExportedAt: null }
  }

  const parsed = parseJson(storage.getItem(metaKey))
  const value =
    parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>).lastExportedAt
      : null

  return { lastExportedAt: isDateKey(value) ? value : null }
}

export function markExported(
  date: DateKey,
  storage: StorageLike | null = defaultStorage()
): void {
  if (!storage) {
    return
  }

  try {
    storage.setItem(metaKey, JSON.stringify({ lastExportedAt: date }))
  } catch {
    return
  }

  notify()
}

/**
 * Local storage is the only copy, and losing it is silent and unrecoverable.
 * Nudge once there is history worth losing and it has gone unbacked-up.
 */
export function shouldNudgeBackup(
  today: DateKey,
  meta: AppMeta,
  recordedDays: number
): boolean {
  if (recordedDays === 0) {
    return false
  }

  if (!meta.lastExportedAt) {
    return recordedDays >= 3
  }

  return daysBetweenDateKeys(meta.lastExportedAt, today) >= backupNudgeDays
}

/**
 * Counts stored day keys without parsing them. This runs on every render of the
 * backup card, so it must stay cheap; empty days are pruned after three days,
 * which makes a key count a close enough proxy for "there is history here".
 */
export function countStoredDays(
  storage: StorageLike | null = defaultStorage()
): number {
  if (!storage) {
    return 0
  }

  return storedDateKeys(storage).length
}

export type ImportResult = {
  imported: number
  skipped: number
  error: string | null
}

export function importData(
  json: string,
  storage: StorageLike | null = defaultStorage()
): ImportResult {
  const payload = parseJson(json)

  if (!payload || typeof payload !== "object") {
    return { imported: 0, skipped: 0, error: "That file is not valid JSON." }
  }

  const days = (payload as Record<string, unknown>).days

  if (!Array.isArray(days)) {
    return {
      imported: 0,
      skipped: 0,
      error: "That file has no Court Ready days in it.",
    }
  }

  let imported = 0
  let skipped = 0

  for (const entry of days) {
    const date =
      entry && typeof entry === "object"
        ? (entry as Record<string, unknown>).date
        : null

    if (!isDateKey(date)) {
      skipped += 1
      continue
    }

    const record = parseDayRecord(entry, date)

    if (isEmptyRecord(record)) {
      skipped += 1
      continue
    }

    if (storage) {
      try {
        storage.setItem(dayKeyPrefix + date, JSON.stringify(record))
      } catch {
        skipped += 1
        continue
      }
    }

    imported += 1
  }

  if (imported > 0) {
    notify()
  }

  return { imported, skipped, error: null }
}

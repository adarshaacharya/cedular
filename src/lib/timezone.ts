type ZonedParts = {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  second: number; // 0-59
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  // Cache not strictly necessary; keep it simple and predictable.
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const dtf = getPartsFormatter(timeZone);
  const parts = dtf.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => {
    const p = parts.find((x) => x.type === type)?.value;
    if (!p) throw new Error(`Missing Intl part "${type}" for timeZone=${timeZone}`);
    return Number(p);
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

// Returns offset in milliseconds where positive means the timezone is ahead of UTC (e.g. +05:45).
export function getTimeZoneOffsetMs(dateUtc: Date, timeZone: string): number {
  const p = getZonedParts(dateUtc, timeZone);
  const utcAsIfZoned = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return utcAsIfZoned - dateUtc.getTime();
}

export function zonedPartsToUtc(parts: ZonedParts, timeZone: string): Date {
  const utcGuess = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  // Two-pass to handle DST zones (Kathmandu has no DST, but this keeps it correct generally).
  let d = new Date(utcGuess);
  const offset = getTimeZoneOffsetMs(d, timeZone);
  d = new Date(utcGuess - offset);
  const offset2 = getTimeZoneOffsetMs(d, timeZone);
  if (offset2 !== offset) {
    d = new Date(utcGuess - offset2);
  }
  return d;
}

export function formatRFC3339WithOffset(dateUtc: Date, timeZone: string): string {
  const p = getZonedParts(dateUtc, timeZone);
  const offsetMs = getTimeZoneOffsetMs(dateUtc, timeZone);
  const sign = offsetMs >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMs);
  const offH = Math.floor(abs / 3_600_000);
  const offM = Math.floor((abs % 3_600_000) / 60_000);

  return (
    `${p.year}-${pad2(p.month)}-${pad2(p.day)}` +
    `T${pad2(p.hour)}:${pad2(p.minute)}:${pad2(p.second)}` +
    `${sign}${pad2(offH)}:${pad2(offM)}`
  );
}

export function formatDateInTimeZone(dateUtc: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateUtc);
}

export function formatTimeInTimeZone(dateUtc: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateUtc);
}

export function getWeekdayIndex(dateUtc: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(dateUtc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const idx = map[wd];
  if (idx === undefined) throw new Error(`Unexpected weekday "${wd}"`);
  return idx;
}


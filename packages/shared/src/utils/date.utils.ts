import dayjs from "dayjs";
import { ISO_DATE_FORMAT } from "./constants.utils.js";
export const fromTimestampToSqlDatetime = (date: string) =>
  date.replace("T", " ").replace("Z", "");

export const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export function isValidDate(date: string): boolean {
  const parsedDate = dayjs(date, ISO_DATE_FORMAT, true);
  return parsedDate.isValid();
}

export const adjustToPreferredDayWithinRange = (
  baseDate: Date,
  preferredDay: number,
  startDate: Date,
  endDate: Date,
): Date => {
  const base = normalizeDate(baseDate);
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  const baseDay = base.getDay();

  const forwardOffset = (preferredDay - baseDay + 7) % 7;
  const forward = new Date(base);
  forward.setDate(forward.getDate() + forwardOffset);

  if (forward <= end) return forward;

  const backwardOffset = (baseDay - preferredDay + 7) % 7;
  const backward = new Date(base);
  backward.setDate(backward.getDate() - backwardOffset);

  if (backward >= start) return backward;

  return baseDate;
};

type DurationOpts = {
  /** If true, treat end earlier than start as next-day. Default: false */
  allowNextDay?: boolean;
  /** Parsing format. Default: "HH:mm" */
  format?: string;
};

export function durationMinutesHHMM(
  startHHMM: string,
  endHHMM: string,
  opts: DurationOpts = {},
): number {
  const { allowNextDay = false, format = "HH:mm" } = opts;

  const start = dayjs(startHHMM, format, true); // strict
  const end = dayjs(endHHMM, format, true); // strict

  if (!start.isValid())
    throw new Error(
      `Invalid start time "${startHHMM}". Expected format ${format}.`,
    );
  if (!end.isValid())
    throw new Error(
      `Invalid end time "${endHHMM}". Expected format ${format}.`,
    );

  let diff = end.diff(start, "minute");

  if (allowNextDay && diff <= 0) diff += 24 * 60;

  return diff;
}

export const toMinutes = (time: string, strict = true): number => {
  const d = dayjs(time, "HH:mm", strict);
  if (!d.isValid()) {
    throw new Error(`Invalid time "${time}". Expected "HH:mm".`);
  }
  return d.hour() * 60 + d.minute();
};
export const toUTCDateOnly = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export const getUTCMonthStart = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));

export const eachUTCDate = (from: Date, to: Date) => {
  const out: Date[] = [];

  let cur = toUTCDateOnly(from);
  const end = toUTCDateOnly(to);

  while (cur.getTime() <= end.getTime()) {
    out.push(cur);
    cur = new Date(
      Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate() + 1),
    );
  }

  return out;
};

export const makeKey = (vendorId: number, d: Date) => {
  const u = toUTCDateOnly(d);
  const yyyy = u.getUTCFullYear();
  const mm = String(u.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(u.getUTCDate()).padStart(2, "0");
  return `${vendorId}|${yyyy}-${mm}-${dd}`;
};

export function monthRange(year: number, month: number) {
  // month: 1-12
  const start = new Date(year, month - 1, 1);
  const endExclusive = new Date(year, month, 1);
  const end = new Date(endExclusive);
  end.setDate(end.getDate() - 1);
  return { start, end, endExclusive };
}

export function monthsBetweenInclusive(from: Date, to: Date): number {
  // if to is before from => 0
  const y1 = from.getFullYear();
  const m1 = from.getMonth(); // 0-11
  const y2 = to.getFullYear();
  const m2 = to.getMonth();

  const diff = (y2 - y1) * 12 + (m2 - m1) + 1;
  return Math.max(0, diff);
}

export function toStartOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export function addDaysLocal(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
export const ymd = (d: Date) => d.toISOString().slice(0, 10);

export function utcDayRange(d: Date) {
  const day = d.toISOString().slice(0, 10);
  const start = new Date(`${day}T00:00:00.000Z`);
  const end = new Date(`${day}T00:00:00.000Z`);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export const daysBetween = (from: Date, to: Date) =>
  Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

export const weeksBetween = (from: Date, to: Date) =>
  Math.floor(daysBetween(from, to) / 7);

export const monthsBetween = (from: Date, to: Date) =>
  to.getFullYear() * 12 +
  to.getMonth() -
  (from.getFullYear() * 12 + from.getMonth());

export function calculateMissedAt(
  scheduledAt: Date,
  graceType?: "HOURS" | "DAYS",
  graceValue?: number,
): Date {
  if (!graceType || !graceValue) {
    return scheduledAt;
  }

  const missedAt = new Date(scheduledAt);

  if (graceType === "HOURS") {
    missedAt.setHours(missedAt.getHours() + graceValue);
  }

  if (graceType === "DAYS") {
    missedAt.setDate(missedAt.getDate() + graceValue);
  }

  return missedAt;
}
export const runDateIso = (d: Date) => {
  const u = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const yyyy = u.getUTCFullYear();
  const mm = String(u.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(u.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const parseTimeToDate = (time: string, date: Date): Date => {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const formatDateToYMD = (date: Date): string => {
  return dayjs(date).format(ISO_DATE_FORMAT);
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

export const convertDatesToYMD = <T>(data: T): T => {
  if (data instanceof Date) {
    return formatDateToYMD(data) as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => convertDatesToYMD(item)) as T;
  }

  if (isPlainObject(data)) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        convertDatesToYMD(value),
      ]),
    ) as T;
  }

  return data;
};

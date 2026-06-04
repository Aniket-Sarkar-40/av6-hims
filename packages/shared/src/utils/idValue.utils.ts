/* eslint-disable @typescript-eslint/no-unused-vars */

import { WithoutAudit } from "@/types/common.js";

export function toPickFields<T, const K extends readonly (keyof T)[]>(
  row: T | null | undefined,
  keys: K
): { [P in K[number]]: T[P] } | null {
  if (!row) return null;

  const out = {} as { [P in K[number]]: T[P] };

  for (const key of keys) {
    out[key] = row[key];
  }

  return out;
}

export function projectFields<T, const M extends Record<string, keyof T>>(
  row: T | null | undefined,
  map: M
): { [P in keyof M]: T[M[P]] } | null {
  if (!row) return null;

  const out = Object.fromEntries(
    (Object.keys(map) as Array<keyof M>).map((outKey) => {
      const inKey = map[outKey];
      return [outKey, row[inKey]];
    })
  ) as { [P in keyof M]: T[M[P]] };

  return out;
}

export function omitAudit<T extends object>(
  input: T | null | undefined
): WithoutAudit<T>;
export function omitAudit<T extends object>(
  input: Array<T | null | undefined>
): Array<WithoutAudit<T>>;

// Impl
export function omitAudit<T extends object>(
  input: T | null | undefined | Array<T | null | undefined>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strip = (row: any) => {
    if (row == null) return row;
    const {
      isActive,
      createdBy,
      updatedBy,
      deletedBy,
      createdAt,
      updatedAt,
      deletedAt,
      ...rest
    } = row;
    return rest;
  };

  if (Array.isArray(input)) {
    return input.filter(Boolean).map((r) => strip(r as T)) as Array<
      WithoutAudit<T>
    >;
  }

  if (input == null) return null;
  return strip(input) as WithoutAudit<T>;
}

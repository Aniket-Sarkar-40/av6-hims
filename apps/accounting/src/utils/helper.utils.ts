import { BaseModel, BaseModelAttr } from "@/types/common.js";
import { IdValue } from "@/types/global.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { customOmit } from "av6-utils";
import Joi from "joi";

type PrecisionKey = "roundingPrecision";

type Opts = {
  key: PrecisionKey;
  min?: number;
  max?: number;
  required?: boolean;
  strict?: boolean;
  exact?: boolean; // if true => exactly N decimals, else => at most N,
};

function getPrecision(key: PrecisionKey, fallback = 2): number {
  const store = requestStorage.getStore();
  const settings = store?.settings as any;
  const p = settings?.[key] ?? settings?.["roundingPrecision"];
  return Number.isInteger(p) && p && p >= 0 ? p : fallback;
}
function countDecimals(value: number): number {
  // Avoid scientific notation issues
  const s = value.toString();
  if (s.includes("e") || s.includes("E")) {
    // Convert to fixed-ish string safely for counting (still best-effort)
    const [base, expStr] = s.toLowerCase().split("e");
    const exp = Number(expStr);
    const baseDecimals = (base.split(".")[1] ?? "").length;
    return Math.max(0, baseDecimals - exp);
  }
  return (s.split(".")[1] ?? "").length;
}

export function joiDecimalFromSettings(opts: Opts) {
  const {
    key,
    min,
    max,
    required = false,
    strict = true,
    exact = false,
  } = opts;

  let s = Joi.number();

  if (strict) s = s.strict();
  if (min !== undefined) s = s.min(min);
  if (max !== undefined) s = s.max(max);

  s = s.custom((value, helpers) => {
    const precision = getPrecision(key, 2);

    // allow integers even when precision > 0 (decimals = 0)
    const decimals = countDecimals(value);

    if (!exact) {
      if (decimals > precision)
        return helpers.error("number.precision", { limit: precision });
      return value;
    }

    // exact precision:
    if (decimals !== precision)
      return helpers.error("number.precision", { limit: precision });
    return value;
  }, "dynamic precision");

  return required ? s.required() : s.optional().allow(null);
}

export function toPickFieldsWithoutNull<
  T extends { id: number },
  K extends keyof T
>(row: T, ...keys: K[]): Pick<T, "id" | K> {
  const out = {} as Pick<T, "id" | K>;
  out.id = row.id;

  for (const key of keys) {
    out[key] = row[key];
  }

  return out as Pick<T, "id" | K>;
}

export function removeBaseModelArray<T extends BaseModel>(
  input: (T | undefined | null)[]
): Omit<T, BaseModelAttr>[] {
  if (!input?.length) return [];

  return input
    .filter((d): d is T => d != null)
    .map(
      (d) =>
        customOmit(d, [
          "createdAt",
          "canceledAt",
          "canceledBy",
          "createdBy",
          "deletedAt",
          "deletedBy",
          "isActive",
          "updatedAt",
          "updatedBy",
        ]).rest
    );
}

export function toIdValueCountry<T extends { id: number }>(
  row: T | null | undefined,
  valueKey: keyof Omit<T, "id"> & string
): IdValue | null {
  if (!row) return null;
  return { id: row.id, value: String(row[valueKey] ?? "") };
}

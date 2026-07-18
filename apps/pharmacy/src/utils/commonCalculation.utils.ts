import { Prisma } from "@repo/db/generated/prisma/client";
import { DiscMethod } from "@repo/db/generated/prisma/enums.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  CalculationInput,
  DecimalToNumber,
} from "@repo/platform/types/common.js";
import { PrecisionKey } from "@repo/shared/utils/helper.utils.js";
import { CalculationRes } from "av6-core-v2";
import { RoundFormat } from "av6-utils";
import Joi from "joi";

export function applyRound(
  value: number,
  format: RoundFormat,
  precision = 2,
): number {
  switch (format) {
    case RoundFormat.NONE:
      return value;

    case RoundFormat.ROUND:
      return Math.round(value);

    case RoundFormat.SPECIAL_ROUND:
      return value < 1 ? Math.ceil(value) : Math.round(value);

    case RoundFormat.CEIL:
      return Math.ceil(value);

    case RoundFormat.FLOOR:
      return Math.floor(value);

    case RoundFormat.TRUNC:
      return Math.trunc(value);

    case RoundFormat.TO_FIXED:
      return parseFloat(value.toFixed(precision));
  }
}

export const calculation = (input: CalculationInput): CalculationRes => {
  logger.info("entering::calculation::service::validation");

  let actualAmount = input.amount;
  let discountValue = 0;
  const calculationMethod = input.calculationMethod;
  const roundFormat = input.roundFormat;

  //* Calculate actual amount
  if (input.taxMethod === "INCLUSIVE") {
    const inclusiveTaxMultiplier = (100 + input.tax) / 100;
    actualAmount = input.amount / inclusiveTaxMultiplier;
  }
  actualAmount =
    calculationMethod === "STEP_WISE"
      ? applyRound(actualAmount, roundFormat, input.precision)
      : actualAmount;

  //* calculate discount value
  if (input.discountMethod === DiscMethod.FIXED) {
    discountValue = input.discount;
  } else if (input.discountMethod === DiscMethod.PERCENTAGE) {
    discountValue = (actualAmount * input.discount) / 100;
  }
  discountValue =
    calculationMethod === "STEP_WISE"
      ? applyRound(discountValue, roundFormat, input.precision)
      : discountValue;

  // * After discount amount
  let afterDisc = actualAmount - discountValue;
  afterDisc =
    calculationMethod === "STEP_WISE"
      ? applyRound(afterDisc, roundFormat, input.precision)
      : afterDisc;

  //* Calculate Tax
  let calculatedTax = (input.tax * afterDisc) / 100;

  calculatedTax =
    calculationMethod === "STEP_WISE"
      ? applyRound(calculatedTax, roundFormat, input.precision)
      : calculatedTax;

  //* amount after tax (total amount)
  let totalAmount = afterDisc + calculatedTax;
  totalAmount =
    calculationMethod === "STEP_WISE"
      ? applyRound(totalAmount, roundFormat, input.precision)
      : totalAmount;

  logger.info("exiting::calculateDiscountAndTax::service::validation");

  return {
    netDiscount: discountValue,
    netTax: calculatedTax,
    totalAmount,
  };
};

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
  const p = settings?.[key] ?? settings?.["defaultPrecision"];
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

export function toNumberDeep<T>(val: T): DecimalToNumber<T> {
  if (val === null || val === undefined) return val as any;
  if (val instanceof Prisma.Decimal) return val.toNumber() as any;
  if (Array.isArray(val)) return val.map(toNumberDeep) as any;
  // If it’s a Date, just keep it (or you could toISOString() if you prefer)
  if (val instanceof Date) {
    return val as any;
  }
  if (typeof val === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(val as any)) out[k] = toNumberDeep(v);
    return out;
  }
  return val as any;
}

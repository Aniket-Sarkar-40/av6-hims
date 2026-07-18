import { RoundFormat, applyRound } from "av6-utils";
import { ForexDrCrAmt } from "@/types/reports/forexReport.js";
import { DrCr } from "@repo/db/generated/prisma/enums.js";

export const forexAmtToSigned = (value?: ForexDrCrAmt | null): number => {
  if (!value || !value.drCr) return 0;

  return value.drCr === DrCr.DR ? value.amount : -value.amount;
};

export const isRoundedZero = (
  value: number,
  roundingMethod: RoundFormat,
  roundingPrecision: number
): boolean => {
  return applyRound(value, roundingMethod, roundingPrecision) === 0;
};

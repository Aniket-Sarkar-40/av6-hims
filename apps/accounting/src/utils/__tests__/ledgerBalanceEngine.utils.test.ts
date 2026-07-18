import { DrCr } from "@repo/db/generated/prisma/client";
import { describe, expect, it } from "vitest";
import {
  addDifferenceNodeAdvanced,
  addDrCr,
  almostEqual,
  netAsset,
  netExpense,
  netIncome,
  netLiability,
  signedFromDrCr,
  toDrCr,
} from "../ledgerBalanceEngine.utils.js";

describe("ledger balance DR/CR math", () => {
  it("signedFromDrCr maps DR positive and CR negative", () => {
    expect(signedFromDrCr(DrCr.DR, 100)).toBe(100);
    expect(signedFromDrCr(DrCr.CR, 100)).toBe(-100);
  });

  it("toDrCr round-trips signed amounts", () => {
    expect(toDrCr(250)).toEqual({ dr: 250, cr: 0 });
    expect(toDrCr(-75.5)).toEqual({ dr: 0, cr: 75.5 });
    expect(toDrCr(0)).toEqual({ dr: 0, cr: 0 });
  });

  it("addDrCr sums columns independently", () => {
    expect(addDrCr({ dr: 10, cr: 3 }, { dr: 5, cr: 7 })).toEqual({
      dr: 15,
      cr: 10,
    });
  });

  it("almostEqual tolerates floating-point noise under 1e-5", () => {
    expect(almostEqual(1, 1.000009)).toBe(true);
    expect(almostEqual(1, 1.00002)).toBe(false);
  });

  it("net helpers follow accounting sign conventions", () => {
    expect(netIncome({ dr: 40, cr: 100 })).toBe(60);
    expect(netExpense({ dr: 40, cr: 10 })).toBe(30);
    expect(netAsset({ dr: 200, cr: 50 })).toBe(150);
    expect(netLiability({ dr: 20, cr: 80 })).toBe(60);
  });
});

describe("addDifferenceNodeAdvanced", () => {
  it("returns items unchanged when DR and CR are within tolerance", () => {
    const items = [{ id: 1 }];
    const result = addDifferenceNodeAdvanced({
      items,
      drTotal: 100,
      crTotal: 100.00005,
      type: "PERIOD",
      createNode: (diff, type) => ({ id: 99, diff, type }),
    });

    expect(result.items).toHaveLength(1);
    expect(result.totals).toEqual({ dr: 100, cr: 100.00005 });
  });

  it("inserts a balancing node and equalizes totals when DR > CR", () => {
    const items: Array<{ label: string; amount: number }> = [];
    const result = addDifferenceNodeAdvanced({
      items,
      drTotal: 105,
      crTotal: 100,
      type: "CLOSING",
      createNode: (diff, type) => ({
        label: `${type}:${diff}`,
        amount: Math.abs(diff),
      }),
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]!.label).toBe("CLOSING:5");
    expect(result.totals.dr).toBe(105);
    expect(result.totals.cr).toBe(105);
  });

  it("increases DR when CR exceeds DR", () => {
    const items: number[] = [];
    const result = addDifferenceNodeAdvanced({
      items,
      drTotal: 90,
      crTotal: 100,
      type: "OPENING",
      createNode: (diff) => diff,
    });

    expect(result.items).toEqual([-10]);
    expect(result.totals).toEqual({ dr: 100, cr: 100 });
  });
});

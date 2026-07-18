import { DrCr } from "@repo/db/generated/prisma/client";
import { describe, expect, it } from "vitest";
import type { BankStatementExcelFormatConfig } from "@/types/bankReconciliation/bankReconciliation.js";
import {
  getBankMovementFromStatementRowDrCr,
  getBankMovementFromVoucherLineDrCr,
  normalizeText,
  parseAmountOrNull,
  parseDrCr,
} from "../bankReconciliation.utils.js";

const emptyConfig = {
  columns: {},
  amountMode: "SINGLE",
} as unknown as BankStatementExcelFormatConfig;

describe("bank reconciliation DR/CR helpers", () => {
  it("maps voucher line DR/CR to bank movement", () => {
    expect(getBankMovementFromVoucherLineDrCr("DR")).toBe("IN");
    expect(getBankMovementFromVoucherLineDrCr("CR")).toBe("OUT");
  });

  it("maps statement row DR/CR to bank movement (inverted vs voucher)", () => {
    expect(getBankMovementFromStatementRowDrCr("CR")).toBe("IN");
    expect(getBankMovementFromStatementRowDrCr("DR")).toBe("OUT");
  });

  it("parseDrCr normalizes common debit/credit labels", () => {
    expect(
      parseDrCr({ value: "DR", amount: 10, rowNo: 1, config: emptyConfig }),
    ).toBe(DrCr.DR);
    expect(
      parseDrCr({ value: "debit", amount: 10, rowNo: 1, config: emptyConfig }),
    ).toBe(DrCr.DR);
    expect(
      parseDrCr({
        value: "WITHDRAWAL",
        amount: 10,
        rowNo: 1,
        config: emptyConfig,
      }),
    ).toBe(DrCr.DR);
    expect(
      parseDrCr({ value: "CR", amount: 10, rowNo: 1, config: emptyConfig }),
    ).toBe(DrCr.CR);
    expect(
      parseDrCr({
        value: "deposit",
        amount: 10,
        rowNo: 1,
        config: emptyConfig,
      }),
    ).toBe(DrCr.CR);
  });

  it("parseDrCr falls back to amount sign when label is blank", () => {
    expect(
      parseDrCr({ value: "", amount: -25, rowNo: 2, config: emptyConfig }),
    ).toBe(DrCr.DR);
    expect(
      parseDrCr({ value: "", amount: 25, rowNo: 2, config: emptyConfig }),
    ).toBe(DrCr.CR);
  });

  it("parseAmountOrNull accepts numbers, currency strings, and blanks", () => {
    expect(
      parseAmountOrNull({ value: "1,234.50", rowNo: 1, label: "Amount" }),
    ).toBe(1234.5);
    expect(parseAmountOrNull({ value: 10, rowNo: 1, label: "Amount" })).toBe(
      10,
    );
    expect(parseAmountOrNull({ value: "", rowNo: 1, label: "Amount" })).toBeNull();
    expect(
      parseAmountOrNull({ value: "(100.00)", rowNo: 1, label: "Amount" }),
    ).toBe(-100);
  });

  it("normalizeText strips non-alphanumerics for fuzzy matching", () => {
    expect(normalizeText("  Neo-Bank #12 ")).toBe("neobank12");
  });
});

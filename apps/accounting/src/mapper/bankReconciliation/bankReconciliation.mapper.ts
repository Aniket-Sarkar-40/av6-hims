import { commonGetService } from "@/services/common.service.js";
import {
  BankMatchResponseForBankStatementRowDTO,
  BankStatementDTO,
  BankStatementExcelRow,
  BankStatementRowDTO,
  BankStatementRowResponse,
  CreateOrUpdateBankStatementExcelCreateInput,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import { BankStatement } from "@repo/db/generated/prisma/client";
import { DrCr } from "@repo/db/generated/prisma/enums.js";
import { toPublicImageUrl } from "@repo/shared/utils/helper.utils.js";

import { customOmit, toIdValue } from "av6-utils";
import dayjs from "dayjs";

export function mapRowToBankStatementExcelCreateInput(
  row: BankStatementExcelRow,
  rowNo: number
): CreateOrUpdateBankStatementExcelCreateInput {
  return {
    rowNo,
    transactionDate: dayjs(row["Transaction Date"]).format("YYYY-MM-DD"),
    valueDate: dayjs(row["Value Date"]).format("YYYY-MM-DD") ?? null,
    transactionId: row["Transaction ID"],
    chequeNo: row["Cheque No"] ?? null,
    description: row["Description"] ?? null,
    drCr: row["Dr/Cr"] as DrCr,
    transactionAmount: Number(row["Transaction Amount"]),
    voucherNo: row["Voucher No"] ?? null,
    voucherType: row["Voucher Type"] ?? null,
    ledgerName: row["Ledger Name"] ?? null,
    bankName: row["Bank Name"] ?? null,
  };
}

export const toBankStatementRowDTO = async (
  input: BankStatementRowResponse[]
): Promise<BankStatementRowDTO[]> => {
  const response: BankStatementRowDTO[] = await Promise.all(
    input.map(async (bankStatement) => {
      const omittedData = customOmit<
        BankStatementRowResponse,
        BaseModelAttrWoCancel | "bankMatches"
      >(bankStatement, [
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "bankMatches",
        // "lastReconciledBy",
      ]);

      // const lastReconciledBy = bankStatement.lastReconciledBy
      //   ? await coreRequests.getEmployeeCache(bankStatement.lastReconciledBy)
      //   : null;
      const bankMatches: BankMatchResponseForBankStatementRowDTO[] =
        bankStatement.bankMatches.map((bankMatch) => {
          return {
            ...customOmit(bankMatch, [
              "isActive",
              "createdBy",
              "createdAt",
              "updatedBy",
              "updatedAt",
              "deletedBy",
              "deletedAt",
              "voucherLine",
              "bankStatementRowId",
              "voucherLineId",
            ]).rest,
            voucherLine: {
              ...customOmit(bankMatch.voucherLine, [
                "isActive",
                "createdBy",
                "createdAt",
                "updatedBy",
                "updatedAt",
                "deletedBy",
                "deletedAt",
              ]).rest,
              voucher: {
                ...customOmit(bankMatch.voucherLine.voucher, [
                  "isActive",
                  "createdBy",
                  "createdAt",
                  "updatedBy",
                  "updatedAt",
                  "deletedBy",
                  "deletedAt",
                ]).rest,
              },
            },
          };
        });
      return {
        ...omittedData.rest,
        drCr: bankStatement.drCr === DrCr.CR ? DrCr.DR : DrCr.CR,
        // lastReconciledBy: lastReconciledBy ? toIdValue(lastReconciledBy, "name") : null,
        bankMatches,
      };
    })
  );
  return response;
};
export const toBankStatementDTO = async (
  input: BankStatement[]
): Promise<BankStatementDTO[]> => {
  const ledgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const response: BankStatementDTO[] = input.map((bankStatement) => {
    return {
      ...customOmit(bankStatement, [
        "isActive",
        "createdBy",
        "createdAt",
        "updatedBy",
        "updatedAt",
        "deletedBy",
        "deletedAt",
        "fileUrl",
        "ledgerId",
      ]).rest,
      ledger: toIdValue(
        ledgers.find((ledger) => ledger.id === bankStatement.ledgerId),
        "name"
      ),
      fileUrl: toPublicImageUrl(bankStatement.fileUrl),
    };
  });
  return response;
};

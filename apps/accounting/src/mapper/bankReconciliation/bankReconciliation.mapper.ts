import { commonGetService } from "@/services/common.service.js";
import {
  BankMatchResponseForBankStatementRowDTO,
  BankStatementDTO,
  BankStatementRowDTO,
  BankStatementRowResponse,
  CreateOrUpdateBankStatementExcelCreateInput,
  ExcelRow,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { BaseModelAttrWoCancel } from "@/types/common.js";
import {
  getAmountAndDrCr,
  getExcelFormatConfig,
  getMappedValue,
  isRecord,
  parseDateOrNull,
  parseStringOrNull,
} from "@/utils/bankReconciliation.utils.js";
import {
  BankStatement,
  BankStatementFormatMapping,
  DrCr,
} from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { toPublicImageUrl } from "@repo/shared/utils/helper.utils.js";
import { customOmit, toIdValue } from "av6-utils";

export const mapRowToBankStatementExcelCreateInput = (params: {
  row: unknown;
  rowNo: number;
  statementFormat: BankStatementFormatMapping;
}): CreateOrUpdateBankStatementExcelCreateInput => {
  const { row, rowNo, statementFormat } = params;

  if (!isRecord(row)) {
    throw new ErrorHandler(400, `Row ${rowNo}: Invalid excel row format`);
  }

  if (!statementFormat) {
    throw new ErrorHandler(400, "Bank statement not configured in the system");
  }

  const config = getExcelFormatConfig(statementFormat.excelFormat);

  const { transactionAmount, drCr } = getAmountAndDrCr({
    row: row as ExcelRow,
    config,
    rowNo,
  });

  return {
    rowNo,
    transactionDate: parseDateOrNull({
      value: getMappedValue(row, config, "transactionDate"),
      rowNo,
      label: "Transaction Date",
      dateFormats: config.dateFormats,
      required: true,
    }) as string,
    valueDate: parseDateOrNull({
      value: getMappedValue(row, config, "valueDate"),
      rowNo,
      label: "Value Date",
      dateFormats: config.dateFormats,
      required: false,
    }),
    transactionId: parseStringOrNull(
      getMappedValue(row, config, "transactionId"),
    ),
    chequeNo: parseStringOrNull(getMappedValue(row, config, "chequeNo")),
    description: parseStringOrNull(getMappedValue(row, config, "description")),
    drCr,
    transactionAmount,
    voucherNo: parseStringOrNull(getMappedValue(row, config, "voucherNo")),
    voucherType: parseStringOrNull(getMappedValue(row, config, "voucherType")),
    ledgerName: parseStringOrNull(getMappedValue(row, config, "ledgerName")),
    bankName: parseStringOrNull(getMappedValue(row, config, "bankName")),
  };
};

export const toBankStatementRowDTO = async (
  input: BankStatementRowResponse[],
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
    }),
  );
  return response;
};
export const toBankStatementDTO = async (
  input: BankStatement[],
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
        "name",
      ),
      fileUrl: toPublicImageUrl(bankStatement.fileUrl),
    };
  });
  return response;
};

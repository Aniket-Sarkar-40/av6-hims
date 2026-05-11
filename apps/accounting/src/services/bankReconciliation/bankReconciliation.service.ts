import { auditProxy } from "@/config/audit.config.js";
import { requestStorage } from "@/config/requestContext.js";
import { mapRowToBankStatementExcelCreateInput } from "@/mapper/bankReconciliation/bankReconciliation.mapper.js";
import {
  bankStatementExcelBatchJob,
  createBankStatementExcelInDb,
  getSummaryStatementRows,
  getUnmatchedBankStatementRowsForAutoSuggestion,
  manualBankReconcileWithBankStatementRowInDb,
} from "@/repository/bankReconciliation/bankReconciliation.repository.js";
import {
  getBankLedgerBookLines,
  getSummaryVoucherRows,
  getUnmatchedVoucherLinesForBankAutoSuggestion,
  manualReconcileVoucherLines,
} from "@/repository/voucher/voucher.repository.js";
import {
  AutoMatchSuggestionInput,
  AutoMatchSuggestionResponse,
  AutoMatchSuggestionRow,
  BankLedgerBookRequestInput,
  BankLedgerBookResponse,
  BankLedgerBookRow,
  BankReconciliationSummaryRequestInput,
  BankReconciliationSummaryResponse,
  BankStatementExcelBaseInput,
  BankStatementExcelRow,
  ManualBankReconcileWithBankStatementInput,
  ManualReconcileRequestInput,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { voucherHeadResponseForLedgerBook } from "@/types/reports/ledgerBook.js";

import { applyRound, customOmit, RoundFormat, toIdValue } from "av6-utils";
import dayjs from "dayjs";
import XLSX from "xlsx";
import { commonGetService } from "../common.service.js";
import { getLedgerBalancesNumber } from "../report/ledgerBalanceEngine.service.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { DrCr } from "@repo/db/generated/prisma/enums.js";
import {
  addSigned,
  decToNum,
  toDrCr,
} from "@/utils/ledgerBalanceEngine.utils.js";
import { BankStatementRow, Group } from "@repo/db/generated/prisma/client";
import {
  getBankMovementFromStatementRowDrCr,
  getBankMovementFromVoucherLineDrCr,
  normalizeText,
} from "@/utils/bankReconciliation.utils.js";
import {
  validateAutoMatchSuggestionServiceValidation,
  validateBankReconciliationCommonServiceValidation,
  validateManualBankReconcileWithBankStatementServiceValidation,
  validateManualReconcileVoucherLinesServiceValidation,
} from "@/validations/service/bankReconciliation/bankReconciliation.service.validation.js";
import { validateIdLedger } from "@/validations/service/master/ledger.service.validation.js";
const bankReconciliationRaw = {
  async getUnReconciledBankLedgerBook(
    input: BankLedgerBookRequestInput
  ): Promise<BankLedgerBookResponse> {
    logger.info("entering::getUnReconciledBankLedgerBook::service");
    const store = requestStorage.getStore();
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;
    const ledger = await validateBankReconciliationCommonServiceValidation(
      input
    );

    const { companyId, financialYearId, ledgerId, fromDate, toDate, ccId } =
      input;

    const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
      cacheCode: "VOUCHER_TYPE",
      canNullReturnable: true,
      modelName: "VoucherType",
      shortCode: "VOUCHER_TYPE",
      useActiveFlag: true,
    });

    const group = (await commonGetService.getElementById<"Group">({
      cacheCode: "GROUP",
      canNullReturnable: true,
      modelName: "Group",
      id: ledger.groupId,
      shortCode: "GROUP",
      useActiveFlag: true,
    })) as Group;

    if (!group) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", `Group for ledger ${ledger.name}`)
      );
    }

    const [balance] = await getLedgerBalancesNumber({
      companyId,
      financialYearId,
      fromDate,
      toDate: toDate, // engine uses before-from and opening; toDate not needed for opening
      ccId,
      ledgerIds: [ledgerId],
      includeZero: true,
    });

    const opening = balance?.opening ?? { dr: 0, cr: 0 };

    let runningSigned = opening.dr - opening.cr;

    const lines = await getBankLedgerBookLines(input);

    let totalDr = 0;
    let totalCr = 0;

    const rows: BankLedgerBookRow[] = [];

    for (const l of lines) {
      const amt = decToNum(l.amount);
      const dr = l.drCr === DrCr.DR ? amt : 0;
      const cr = l.drCr === DrCr.CR ? amt : 0;

      totalDr += dr;
      totalCr += cr;

      runningSigned = addSigned(runningSigned, dr, cr);

      const voucherType = voucherTypes.find(
        (v) => v.id === l.voucher.voucherTypeId
      );
      const voucherHeadResponse: voucherHeadResponseForLedgerBook = {
        ...customOmit(l.voucher, [
          "voucherTypeId",
          "isActive",
          "createdBy",
          "createdAt",
          "updatedBy",
          "updatedAt",
          "deletedBy",
          "deletedAt",
        ]).rest,
        voucherType: voucherType ? toIdValue(voucherType, "name") : null,
      };

      const bankMatches = l.bankMatches.map((bankMatch) => {
        return {
          ...bankMatch,
          bankStatementRow: {
            ...bankMatch.bankStatementRow,
            drCr:
              bankMatch.bankStatementRow.drCr === DrCr.CR ? DrCr.DR : DrCr.CR,
          },
        };
      });
      rows.push({
        ...l,
        bankMatches,
        voucher: voucherHeadResponse,
        runningBalance: toDrCr(runningSigned),
      });
    }

    const closing = toDrCr(runningSigned);

    return {
      ledger: toIdValue(ledger, "name"),
      openingBalance: opening,
      rows,
      totals: {
        dr: applyRound(totalDr, roundingMethod, roundingPrecision),
        cr: applyRound(totalCr, roundingMethod, roundingPrecision),
      },
      closingBalance: closing,
    };
  },
  async manualReconcileVoucherLines(
    input: ManualReconcileRequestInput
  ): Promise<void> {
    logger.info("entering::manualReconcileVoucherLines::service");
    await validateManualReconcileVoucherLinesServiceValidation(input);
    await manualReconcileVoucherLines(input);
    logger.info("exiting::manualReconcileVoucherLines::service");
  },

  async createBankStatementExcel(params: {
    filePath: string;
    baseInput: BankStatementExcelBaseInput;
  }) {
    logger.info("entering::createBankStatementExcel::service");

    const { filePath, baseInput } = params;

    await validateBankReconciliationCommonServiceValidation({
      companyId: baseInput.companyId,
      financialYearId: baseInput.financialYearId,
      ledgerId: baseInput.ledgerId,
      fromDate: baseInput.statementFrom,
      toDate: baseInput.statementTo,
    });

    if (!filePath) {
      throw new ErrorHandler(400, "No file path provided");
    }

    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
    }) as BankStatementExcelRow[];

    if (data.length === 0) {
      throw new ErrorHandler(400, "Excel file is empty");
    }

    // validateBankStatementExcelHeaders(data[0]);

    const convertedData = data.map((row, index) =>
      mapRowToBankStatementExcelCreateInput(row, index + 1)
    );

    const batch = await createBankStatementExcelInDb(convertedData);

    bankStatementExcelBatchJob({ batchJobId: batch.id, baseInput })
      .then(() =>
        logger.info("Bank Statement Excel Batch Processing Completed")
      )
      .catch((e) => logger.error(JSON.stringify(e)));

    logger.info("exiting::createBankStatementExcel::service");
  },
  async manualBankReconcileWithBankStatement(
    input: ManualBankReconcileWithBankStatementInput
  ): Promise<void> {
    logger.info("entering::manualBankReconcileWithBankStatement::service");
    await validateManualBankReconcileWithBankStatementServiceValidation(input);
    await manualBankReconcileWithBankStatementRowInDb(input.rows);
    logger.info("exiting::manualBankReconcileWithBankStatement::service");
  },

  async getBankReconciliationSummary(
    input: BankReconciliationSummaryRequestInput
  ): Promise<BankReconciliationSummaryResponse> {
    logger.info("entering::getBankReconciliationSummary::service");

    const store = requestStorage.getStore();

    const { ledgerId, fromDate, toDate } = input;
    const settings = store?.settings;
    const roundingPrecision = settings?.roundingPrecision ?? 2;
    const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

    const ledger = await validateIdLedger(ledgerId);
    if (!ledger.isBankAccount) {
      throw new ErrorHandler(400, "Selected ledger is not a bank ledger.");
    }

    const voucherRows = await getSummaryVoucherRows({
      ledgerId,
      fromDate,
      toDate,
    });

    const statementRows = await getSummaryStatementRows({
      ledgerId,
      fromDate,
      toDate,
    });

    let bankBookIn = 0;
    let bankBookOut = 0;

    let unreconciledBookIn = 0;
    let unreconciledBookOut = 0;

    let unreconciledBookInCount = 0;
    let unreconciledBookOutCount = 0;

    for (const row of voucherRows) {
      const amount = Number(row.amount || 0);
      const movement = getBankMovementFromVoucherLineDrCr(row.drCr);
      const hasActiveMatch = row.bankMatches.length > 0;

      if (movement === "IN") {
        bankBookIn += amount;
      } else {
        bankBookOut += amount;
      }

      if (!hasActiveMatch) {
        if (movement === "IN") {
          unreconciledBookIn += amount;
          unreconciledBookInCount += 1;
        } else {
          unreconciledBookOut += amount;
          unreconciledBookOutCount += 1;
        }
      }
    }

    let statementIn = 0;
    let statementOut = 0;

    let statementUnreconciledIn = 0;
    let statementUnreconciledOut = 0;

    let statementUnreconciledInCount = 0;
    let statementUnreconciledOutCount = 0;

    for (const row of statementRows) {
      const amount = Number(row.amount || 0);
      const movement = getBankMovementFromStatementRowDrCr(row.drCr);
      const hasActiveMatch = row.bankMatches.length > 0;
      if (movement === "IN") {
        statementIn += amount;
      } else {
        statementOut += amount;
      }

      if (!hasActiveMatch) {
        if (movement === "IN") {
          statementUnreconciledIn += amount;
          statementUnreconciledInCount += 1;
        } else {
          statementUnreconciledOut += amount;
          statementUnreconciledOutCount += 1;
        }
      }
    }

    const bankBookBalance = applyRound(
      bankBookIn - bankBookOut,
      roundingMethod,
      roundingPrecision
    );
    const statementBalance = applyRound(
      statementIn - statementOut,
      roundingMethod,
      roundingPrecision
    );

    /**
     * Tally-style BRS mapping:
     *
     * Available Only in Books:
     * - Add Withdrawals = unreconciled company-book OUT entries
     * - Less Deposits   = unreconciled company-book IN entries
     *
     * Available Only in Bank:
     * - Add Deposits     = unreconciled bank-statement IN entries
     * - Less Withdrawals = unreconciled bank-statement OUT entries
     */
    const availableOnlyInBooksAddWithdrawals = applyRound(
      unreconciledBookOut,
      roundingMethod,
      roundingPrecision
    );
    const availableOnlyInBooksLessDeposits = applyRound(
      unreconciledBookIn,
      roundingMethod,
      roundingPrecision
    );

    const availableOnlyInBankAddDeposits = applyRound(
      statementUnreconciledIn,
      roundingMethod,
      roundingPrecision
    );
    const availableOnlyInBankLessWithdrawals = applyRound(
      statementUnreconciledOut,
      roundingMethod,
      roundingPrecision
    );

    const availableOnlyInBooksNetEffect = applyRound(
      availableOnlyInBooksAddWithdrawals - availableOnlyInBooksLessDeposits,
      roundingMethod,
      roundingPrecision
    );

    const availableOnlyInBankNetEffect = applyRound(
      availableOnlyInBankAddDeposits - availableOnlyInBankLessWithdrawals,
      roundingMethod,
      roundingPrecision
    );

    const expectedBankBalance = applyRound(
      bankBookBalance +
        availableOnlyInBooksAddWithdrawals -
        availableOnlyInBooksLessDeposits +
        availableOnlyInBankAddDeposits -
        availableOnlyInBankLessWithdrawals,
      roundingMethod,
      roundingPrecision
    );

    const difference = applyRound(
      expectedBankBalance - statementBalance,
      roundingMethod,
      roundingPrecision
    );

    const response: BankReconciliationSummaryResponse = {
      ledger: toIdValue(ledger, "name"),
      fromDate: dayjs(fromDate).format("DD-MM-YYYY"),
      toDate: dayjs(toDate).format("DD-MM-YYYY"),

      summary: {
        balanceAsPerCompanyBooks: bankBookBalance,

        availableOnlyInBooks: {
          addWithdrawals: {
            amount: availableOnlyInBooksAddWithdrawals,
            count: unreconciledBookOutCount,
          },
          lessDeposits: {
            amount: availableOnlyInBooksLessDeposits,
            count: unreconciledBookInCount,
          },
          netEffect: availableOnlyInBooksNetEffect,
          count: unreconciledBookOutCount + unreconciledBookInCount,
        },

        availableOnlyInBank: {
          addDeposits: {
            amount: availableOnlyInBankAddDeposits,
            count: statementUnreconciledInCount,
          },
          lessWithdrawals: {
            amount: availableOnlyInBankLessWithdrawals,
            count: statementUnreconciledOutCount,
          },
          netEffect: availableOnlyInBankNetEffect,
          count: statementUnreconciledInCount + statementUnreconciledOutCount,
        },

        totalUnreconciledAmount:
          unreconciledBookOut +
          unreconciledBookIn +
          statementUnreconciledIn +
          statementUnreconciledOut,
        totalUnreconciledCount:
          unreconciledBookOutCount +
          unreconciledBookInCount +
          statementUnreconciledInCount +
          statementUnreconciledOutCount,
        expectedBankBalance,
        balanceAsPerBankStatement: statementBalance,
        difference,
      },
    };

    logger.info("exiting::getBankReconciliationSummary::service");
    return response;
  },
  async getBankAutoSuggestions(
    input: AutoMatchSuggestionInput
  ): Promise<AutoMatchSuggestionResponse> {
    logger.info("entering::getBankAutoSuggestions::service");

    await validateAutoMatchSuggestionServiceValidation(input);
    const { ledgerId, fromDate, toDate } = input;

    const voucherTypes = await commonGetService.getAllElements<"VoucherType">({
      cacheCode: "VOUCHER_TYPE",
      canNullReturnable: true,
      modelName: "VoucherType",
      shortCode: "VOUCHER_TYPE",
      useActiveFlag: true,
    });
    const voucherRows = await getUnmatchedVoucherLinesForBankAutoSuggestion({
      ledgerId,
      fromDate,
      toDate,
    });

    const statementRows = await getUnmatchedBankStatementRowsForAutoSuggestion({
      ledgerId,
      fromDate,
      toDate,
    });

    const suggestions: AutoMatchSuggestionRow[] = [];

    const usedVoucherLineIds = new Set<number>();
    const usedStatementRowIds = new Set<number>();

    const mapAmountDrCr = new Map<string, BankStatementRow[]>();
    const mapCheque = new Map<string, BankStatementRow[]>();
    const mapTxnId = new Map<string, BankStatementRow[]>();
    const mapVoucherNo = new Map<string, BankStatementRow[]>();

    for (const row of statementRows) {
      const amount = Number(row.amount);

      //reverse DR/CR for indexing
      const oppositeDrCr = row.drCr === "DR" ? "CR" : "DR";
      const key = `${amount}_${oppositeDrCr}`;

      if (!mapAmountDrCr.has(key)) mapAmountDrCr.set(key, []);
      mapAmountDrCr.get(key)!.push(row);

      if (row.chequeNo) {
        const k = normalizeText(row.chequeNo);
        if (!mapCheque.has(k)) mapCheque.set(k, []);
        mapCheque.get(k)!.push(row);
      }

      if (row.transactionId) {
        const k = normalizeText(row.transactionId);
        if (!mapTxnId.has(k)) mapTxnId.set(k, []);
        mapTxnId.get(k)!.push(row);
      }

      if (row.voucherNo) {
        const k = normalizeText(row.voucherNo);
        if (!mapVoucherNo.has(k)) mapVoucherNo.set(k, []);
        mapVoucherNo.get(k)!.push(row);
      }
    }

    for (const voucherLine of voucherRows) {
      if (usedVoucherLineIds.has(voucherLine.id)) continue;

      const amount = Number(voucherLine.amount);
      const drCr = voucherLine.drCr;

      let matchedRow: BankStatementRow | null = null;

      //PRIORITY 1: Voucher No + DR/CR + Voucher Type
      if (voucherLine.voucher.voucherNo) {
        const key = normalizeText(voucherLine.voucher.voucherNo);
        const candidates = mapVoucherNo.get(key) || [];

        const valid = candidates.filter((r) => {
          const oppositeDrCr = r.drCr === "DR" ? "CR" : "DR";

          return (
            !usedStatementRowIds.has(r.id) &&
            Number(r.amount) === amount &&
            oppositeDrCr === drCr &&
            (!r.voucherType || // optional match
              normalizeText(r.voucherType).includes(
                normalizeText(
                  voucherTypes.find(
                    (vt) => vt.id === voucherLine.voucher.voucherTypeId
                  )?.name || ""
                )
              ))
          );
        });

        if (valid.length === 1) {
          matchedRow = valid[0];
        }
      }

      //PRIORITY 2: TransactionId in narration
      if (!matchedRow) {
        const text = normalizeText(
          (voucherLine.description || "") +
            (voucherLine.voucher.narration || "")
        );

        for (const [txnId, rows] of mapTxnId.entries()) {
          if (!text.includes(txnId)) continue;

          const valid = rows.filter((r) => {
            const oppositeDrCr = r.drCr === "DR" ? "CR" : "DR";

            return (
              !usedStatementRowIds.has(r.id) &&
              Number(r.amount) === amount &&
              oppositeDrCr === drCr
            );
          });

          if (valid.length === 1) {
            matchedRow = valid[0];
            break;
          }

          if (valid.length > 1) {
            matchedRow = null;
            break;
          }
        }
      }

      //PRIORITY 3: Instrument ↔ Cheque
      if (!matchedRow && voucherLine.instrumentNo) {
        const key = normalizeText(voucherLine.instrumentNo);
        const candidates = mapCheque.get(key) || [];

        const valid = candidates.filter((r) => {
          const oppositeDrCr = r.drCr === "DR" ? "CR" : "DR";

          return (
            !usedStatementRowIds.has(r.id) &&
            Number(r.amount) === amount &&
            oppositeDrCr === drCr
          );
        });

        if (valid.length === 1) {
          matchedRow = valid[0];
        }
      }

      //PRIORITY 4: Date + Narration (STRICT)
      if (!matchedRow) {
        const key = `${amount}_${drCr}`;
        const candidates = mapAmountDrCr.get(key) || [];

        let found: BankStatementRow | null = null;

        for (const row of candidates) {
          if (usedStatementRowIds.has(row.id)) continue;

          const voucherDate = dayjs(voucherLine.voucher.voucherDate);
          const statementDate = dayjs(row.valueDate ?? row.transactionDate);

          const dateDiff = Math.abs(voucherDate.diff(statementDate, "day"));
          if (dateDiff > 2) continue;

          const vText = normalizeText(
            (voucherLine.description || "") +
              (voucherLine.voucher.narration || "")
          );

          const sText = normalizeText(row.description || "");

          if (!vText || !sText) continue;

          if (sText.includes(vText.slice(0, 10))) {
            if (found) {
              found = null; // ambiguity
              break;
            }
            found = row;
          }
        }

        matchedRow = found;
      }

      //FINAL SAFETY
      if (!matchedRow) continue;

      suggestions.push({
        voucherLineId: voucherLine.id,
        bankStatementRowId: matchedRow.id,

        voucherLine: {
          id: voucherLine.id,
          voucherId: voucherLine.voucherId,
          voucherNo: voucherLine.voucher.voucherNo,
          voucherDate: dayjs(voucherLine.voucher.voucherDate).format(
            "DD-MM-YYYY"
          ),
          drCr: voucherLine.drCr,
          voucherType: voucherLine.voucher.voucherTypeId
            ? voucherTypes.find(
                (vt) => vt.id === voucherLine.voucher.voucherTypeId
              )?.name ?? null
            : null,
          amount,
          instrumentNo: voucherLine.instrumentNo,
          description: voucherLine.description,
          narration: voucherLine.voucher.narration,
        },

        bankStatementRow: {
          id: matchedRow.id,
          transactionDate: dayjs(matchedRow.transactionDate).format(
            "DD-MM-YYYY"
          ),
          valueDate: matchedRow.valueDate
            ? dayjs(matchedRow.valueDate).format("DD-MM-YYYY")
            : null,
          voucherNo: matchedRow.voucherNo ?? undefined,
          voucherType: matchedRow.voucherType ?? undefined,
          drCr: matchedRow.drCr === DrCr.DR ? "CR" : "DR",
          amount: Number(matchedRow.amount),
          transactionId: matchedRow.transactionId,
          chequeNo: matchedRow.chequeNo,
          description: matchedRow.description,
        },
      });

      usedVoucherLineIds.add(voucherLine.id);
      usedStatementRowIds.add(matchedRow.id);
    }

    logger.info("exiting::getBankAutoSuggestions::service");

    return { rows: suggestions };
  },
};

export const bankReconciliationService = auditProxy.createAuditedService(
  "bankReconciliation",
  bankReconciliationRaw
);

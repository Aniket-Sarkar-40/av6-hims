import { getByUnique } from "@/repository/common.repository.js";
import {
  AutoMatchSuggestionInput,
  BankStatementRowWithBankStatement,
  ManualBankReconcileWithBankStatementInput,
  ManualReconcileRequestInput,
} from "@/types/bankReconciliation/bankReconciliation.js";
import { LedgerBookRequestInput } from "@/types/reports/ledgerBook.js";
import { validIdCheck } from "@/validations/global.validation.js";
import dayjs from "dayjs";
import { validateIdLedger } from "../master/ledger.service.validation.js";
import { validateLedgerBookServiceValidation } from "../report/report.service.validation.js";
import { validateIdVoucherLine } from "../voucher/voucher.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { BankReconcileStatus } from "@repo/db/generated/prisma/enums.js";

export const validateBankReconciliationCommonServiceValidation = async (
  input: LedgerBookRequestInput
) => {
  logger.info(
    "entering::validateBankReconciliationCommon::service::validation"
  );

  const ledger = await validateLedgerBookServiceValidation(input);
  if (!ledger.isBankAccount) {
    throw new ErrorHandler(400, "Ledger is not a bank account");
  }
  logger.info("exiting::validateBankReconciliationCommon::service::validation");
  return ledger;
};
export const validateIdBankStatementRow = async (
  id: number
): Promise<BankStatementRowWithBankStatement> => {
  logger.info("entering::validateIdBankStatementRow::service::validation");
  validIdCheck(id);
  const bankStatementRow = (await getByUnique({
    model: "BankStatementRow",
    where: {
      id: id,
    },
    useActiveFlag: true,
    args: {
      include: {
        bankStatement: true,
      },
    },
  })) as BankStatementRowWithBankStatement;
  if (!bankStatementRow) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Bank Statement Row")
    );
  }
  logger.info("exiting::validateIdBankStatementRow::service::validation");
  return bankStatementRow;
};

export const validateManualReconcileVoucherLinesServiceValidation = async (
  input: ManualReconcileRequestInput
) => {
  logger.info(
    "entering::validateManualReconcileVoucherLines::service::validation"
  );
  const { ledgerId, rows } = input;
  await validateIdLedger(ledgerId);

  for (const row of rows) {
    const voucherLine = await validateIdVoucherLine(row.voucherLineId);
    if (voucherLine.bankReconcileStatus === BankReconcileStatus.RECONCILED) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Voucher Line")
      );
    }
    if (voucherLine.ledgerId !== ledgerId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Voucher Line", "Ledger")
      );
    }
    if (
      dayjs(voucherLine.voucher.voucherDate).isAfter(dayjs(row.bankClearedDate))
    ) {
      throw new ErrorHandler(
        400,
        "Bank Cleared Date cannot be before Voucher Date"
      );
    }
  }
  logger.info(
    "exiting::validateManualReconcileVoucherLines::service::validation"
  );
};

export const validateManualBankReconcileWithBankStatementServiceValidation =
  async (input: ManualBankReconcileWithBankStatementInput) => {
    logger.info(
      "entering::validateManualBankReconcileWithBankStatement::service::validation"
    );

    const { ledgerId, rows } = input;

    const ledger = await validateIdLedger(ledgerId);
    if (!ledger.isBankAccount) {
      throw new ErrorHandler(400, "Ledger is not a bank account");
    }
    for (const row of rows) {
      const voucherLine = await validateIdVoucherLine(row.voucherLineId);
      const bankStatementRow = await validateIdBankStatementRow(
        row.bankStatementRowId
      );

      if (voucherLine.ledgerId !== ledgerId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_ASSOCIATION", "Voucher Line", "Ledger")
        );
      }
      if (bankStatementRow.bankStatement?.ledgerId !== ledgerId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            "Bank Statement Row",
            "Ledger"
          )
        );
      }

      if (bankStatementRow.reconcileStatus === BankReconcileStatus.RECONCILED) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Bank Statement Row")
        );
      }

      if (voucherLine.bankReconcileStatus === BankReconcileStatus.RECONCILED) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("INVALID_STATUS", "Voucher Line")
        );
      }

      if (Number(voucherLine.amount) !== Number(bankStatementRow.amount)) {
        throw new ErrorHandler(
          400,
          `Voucher Line Amount ${Number(
            voucherLine.amount
          )} is not matching with Bank Statement Row Amount ${Number(
            bankStatementRow.amount
          )}.`
        );
      }

      if (voucherLine.drCr === bankStatementRow.drCr) {
        throw new ErrorHandler(
          400,
          `Voucher Line Dr Cr ${voucherLine.drCr} is not matching with Bank Statement Row Dr Cr ${bankStatementRow.drCr}.`
        );
      }
      row.matchedAmount = Number(voucherLine.amount);
      row.clearedDate = new Date(
        bankStatementRow.valueDate ?? bankStatementRow.transactionDate
      );
      row.bankReferenceNo = bankStatementRow.transactionId;
      row.bankTransactionDate = new Date(bankStatementRow.transactionDate);
    }

    logger.info(
      "exiting::validateManualBankReconcileWithBankStatement::service::validation"
    );
  };

export const validateAutoMatchSuggestionServiceValidation = async (
  input: AutoMatchSuggestionInput
) => {
  logger.info("entering::validateAutoMatchSuggestion::service::validation");
  const { ledgerId, fromDate, toDate } = input;
  const ledger = await validateIdLedger(ledgerId);
  if (!ledger.isBankAccount) {
    throw new ErrorHandler(400, "Ledger is not a bank account");
  }
  if (dayjs(fromDate).isAfter(dayjs(toDate))) {
    throw new ErrorHandler(400, "From Date cannot be after To Date");
  }
  logger.info("exiting::validateAutoMatchSuggestion::service::validation");
};

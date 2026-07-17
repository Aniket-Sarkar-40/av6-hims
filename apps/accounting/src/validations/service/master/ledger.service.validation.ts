import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { validateIdGroup } from "./group.service.validation.js";
import { getCompanyFYByCompanyIdAndFyIdFromDb } from "@/repository/company/company.repository.js";
import { getByUnique } from "@/repository/common.repository.js";
import { validateIdCurrency } from "./currency.service.validation.js";
import { requestStorage } from "@/config/requestContext.js";
import { applyRound, RoundFormat } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { Currency, Ledger } from "@repo/db/generated/prisma/client";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

export const validateIdLedger = async (id: number): Promise<Ledger> => {
  logger.info("entering::validateIdLedger::service::validation");
  validIdCheck(id);
  const ledger = await commonGetService.getElementById<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    id,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  if (!ledger) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Ledger"));
  }
  logger.info("exiting::validateIdLedger::service::validation");
  return ledger;
};

export const createOrUpdateLedgerServiceValidation = async (
  input: CreateOrUpdateLedgerInput
) => {
  logger.info("entering::createOrUpdateLedger::service::validation");
  const { ledgerOpeningBalance } = input;

  const store = requestStorage.getStore();
  const settings = store?.settings;
  const roundingPrecision = settings?.roundingPrecision ?? 2;
  const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

  if (input.id) {
    const ledger = await validateIdLedger(input.id);
    if (ledger.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company")
      );
    }
  }
  let currency: Currency | undefined;
  if (input.currencyId) {
    currency = await validateIdCurrency(input.currencyId);
  }

  const company = await validateIdCompany(input.companyId);
  const group = await validateIdGroup(input.groupId);

  if (group.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Group", "Company")
    );
  }

  if (input.isBankAccount && input.isCashAccount) {
    throw new ErrorHandler(
      400,
      "Bank Account and Cash Account cannot be true at the same time"
    );
  }

  if (input.isBankAccount) {
    if (!input.bankName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Bank Name")
      );
    }
    if (!input.bankIfsc) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Bank IFSC")
      );
    }
    if (!input.bankAccountNo) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Bank Account No")
      );
    }
  }
  const ledger = await getByUnique({
    model: "Ledger",
    where: {
      name: input.name,
      NOT: input.id ? { id: input.id } : undefined,
    },
  });

  if (ledger) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", `Ledger with name ${input.name}`)
    );
  }

  if (ledgerOpeningBalance) {
    const fy = await getCompanyFYByCompanyIdAndFyIdFromDb(
      input.companyId,
      ledgerOpeningBalance.financialYearId
    );
    if (!fy) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", "Financial Year")
      );
    }
    if (!fy.isCurrent) {
      throw new ErrorHandler(400, "Please provide current financial year");
    }
    const asOnDate = new Date(ledgerOpeningBalance.asOnDate);
    if (asOnDate.toDateString() !== fy.booksBeginFrom.toDateString()) {
      throw new ErrorHandler(
        400,
        "Please provide as on date as per current financial year"
      );
    }
    if (input.currencyId) {
      if (
        Number(ledgerOpeningBalance.amount) > 0 &&
        currency?.id !== company.currencyId &&
        !ledgerOpeningBalance.currencyConversionRate
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Currency Conversion Rate")
        );
      }

      ledgerOpeningBalance.currencyAmount = ledgerOpeningBalance.amount;
      ledgerOpeningBalance.amount = applyRound(
        Number(ledgerOpeningBalance.amount) *
          Number(ledgerOpeningBalance.currencyConversionRate ?? 1),
        roundingMethod,
        roundingPrecision
      );

      ledgerOpeningBalance.currencyId = input.currencyId;
    }
  }
  logger.info("exiting::createOrUpdateLedger::service::validation");
};

export const createLedgerExcelServiceValidation = async (params: {
  companyId: number;
  filePath?: string;
}): Promise<void> => {
  logger.info(
    "entering::createLedgerExcelServiceValidation::service::validation"
  );
  const { companyId, filePath } = params;

  await validateIdCompany(companyId);

  if (!filePath) {
    throw new ErrorHandler(400, "No file path provided");
  }

  logger.info(
    "exiting::createLedgerExcelServiceValidation::service::validation"
  );
};

export const validateDeleteLedgerServiceValidation = async (id: number) => {
  logger.info("entering::validateDeleteLedger::service::validation");
  const ledger = await validateIdLedger(id);

  if (ledger.isReserved) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("RESERVED_ITEM", "Ledger")
    );
  }

  const voucherLine = await getByUnique({
    model: "VoucherLine",
    where: {
      ledgerId: ledger.id,
    },
  });

  if (voucherLine) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("ASSOCIATED_ITEM_EXIST", "Ledger", "Voucher")
    );
  }

  logger.info("exiting::validateDeleteLedger::service::validation");
};

export const patchLedgerServiceValidation = async (
  input: Pick<
    CreateOrUpdateLedgerInput,
    "id" | "currencyId" | "creditPeriodInDays"
  >
) => {
  logger.info("entering::patchLedgerServiceValidation::service::validation");
  await validateIdLedger(input.id!);
  logger.info("exiting::patchLedgerServiceValidation::service::validation");
};

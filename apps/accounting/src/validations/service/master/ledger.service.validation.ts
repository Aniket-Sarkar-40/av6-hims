import { commonGetService } from "@/services/common.service.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { validateIdCompany } from "../company/company.service.validation.js";
import { validateIdGroup } from "./group.service.validation.js";
import { getCompanyFYByCompayIdAndFyIdFromDb } from "@/repository/company/company.repository.js";
import { getByUnique } from "@/repository/common.repository.js";
import { logger } from "@repo/platform/logging/logger.js";
import { Ledger } from "@repo/db/generated/prisma/client";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

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

  if (input.id) {
    const ledger = await validateIdLedger(input.id);
    if (ledger.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company")
      );
    }
  }

  if (ledgerOpeningBalance) {
    const fy = await getCompanyFYByCompayIdAndFyIdFromDb(
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
  }
  await validateIdCompany(input.companyId);
  const group = await validateIdGroup(input.groupId);

  if (group.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Group", "Company")
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
  } else {
    if (input.bankName) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_NOT_ALLOWED", "Bank Name")
      );
    }
    if (input.bankIfsc) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_NOT_ALLOWED", "Bank IFSC")
      );
    }
    if (input.bankAccountNo) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_NOT_ALLOWED", "Bank Account No")
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

  logger.info("exiting::createOrUpdateLedger::service::validation");
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

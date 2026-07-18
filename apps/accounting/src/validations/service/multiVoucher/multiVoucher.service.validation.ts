import { getByUnique } from "@/repository/common.repository.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  CreateOrUpdateMultiVoucherInput,
  MultiVoucherResponse,
} from "@/types/multiVoucher/multiVoucher.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import {
  validateIdCompany,
  validateIdFinancialYear,
} from "../company/company.service.validation.js";
import { validateIdVoucherType } from "../master/voucherType.service.validation.js";
import { commonGetService } from "@/services/common.service.js";
import { validateIdLedger } from "../master/ledger.service.validation.js";
import { checkChequeNumberIsUsed } from "@/repository/master/chequeMaster.repository.js";
import { requestStorage } from "@/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  BankTransactionType,
  ChequeMaster,
  DrCr,
  MultiVoucherDetails,
  MultiVoucherStatus,
  Status,
  VoucherNumberingMode,
} from "@repo/db/generated/prisma/client";
import { settingsService } from "@/services/settings/settings.service.js";

export const validateIdMultiVoucher = async (
  id: number
): Promise<MultiVoucherResponse> => {
  logger.info("entering::validateIdMultiVoucher::service::validation");
  validIdCheck(id);
  const multiVoucher = (await getByUnique<"MultiVoucher">({
    model: "MultiVoucher",
    where: { id },
    useActiveFlag: true,
    args: {
      include: {
        multiVoucherDetails: {
          where: { isActive: true },
        },
      },
    },
  })) as MultiVoucherResponse;
  if (!multiVoucher) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Multi Voucher")
    );
  }
  logger.info("exiting::validateIdMultiVoucher::service::validation");
  return multiVoucher;
};

export const validateIdMultiVoucherDetails = async (
  id: number
): Promise<MultiVoucherDetails> => {
  logger.info("entering::validateIdMultiVoucherDetails::service::validation");
  validIdCheck(id);

  const multiVoucherDetails = (await getByUnique<"MultiVoucherDetails">({
    model: "MultiVoucherDetails",
    where: { id },
    useActiveFlag: true,
  })) as MultiVoucherDetails;

  if (!multiVoucherDetails) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Multi Voucher Details")
    );
  }
  logger.info("exiting::validateIdMultiVoucherDetails::service::validation");
  return multiVoucherDetails;
};

export const createOrUpdateMultiVoucherServiceValidation = async (
  input: CreateOrUpdateMultiVoucherInput
) => {
  logger.info(
    "entering::createOrUpdateMultiVoucherServiceValidation::service::validation"
  );
  const settings = await settingsService.getSettings();
  if (!settings) {
    throw new ErrorHandler(400, generateErrorMessage("NOT_FOUND", "Settings"));
  }
  if (input.id) {
    const existingMultiVoucher = await validateIdMultiVoucher(input.id);
    input.existing = existingMultiVoucher;

    if (existingMultiVoucher.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "You can't change company for existing multi voucher"
      );
    }
    // if (existingMultiVoucher.status !== MultiVoucherStatus.DRAFT) {
    //   throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Multi Voucher"));
    // }
  }

  await validateIdCompany(input.companyId);
  const fy = await validateIdFinancialYear(input.financialYearId);

  if (!fy.isCurrent) {
    throw new ErrorHandler(400, "Please provide current financial year");
  }

  if (fy.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company")
    );
  }
  if (input.voucherDate < fy.booksBeginFrom) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MUST_GREATER_THEN",
        "Voucher Date",
        `As per Financial Year books begin from ${fy.booksBeginFrom.toDateString()}`
      )
    );
  }

  if (input.voucherDate > fy.endDate || input.voucherDate < fy.startDate) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MUST_BETWEEN",
        "Voucher Date",
        `Financial Year start date ${fy.startDate.toDateString()}`,
        `Financial Year end date ${fy.endDate.toDateString()}`
      )
    );
  }
  const cc = await validateIdCollectionCenter(input.ccId);
  if (cc.id !== settings.mainBranch?.id) {
    throw new ErrorHandler(401, generateErrorMessage("ACCESS_FAIL"));
  }
  if (cc.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_ASSOCIATION",
        "Collection Center",
        "Company"
      )
    );
  }

  const voucherType = await validateIdVoucherType(input.voucherTypeId);
  if (voucherType.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Voucher Type", "Company")
    );
  }

  const allLedgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  const ledgers = allLedgers.filter((l) => l.companyId === input.companyId);
  // Parent ledger validation

  const parentLedger = ledgers.find((l) => l.id === input.ledgerId);
  if (!parentLedger) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("NOT_FOUND", "Parent Ledger")
    );
  }

  if (Number(input.amount) <= 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MUST_GREATER_THEN", "Header Amount", "0")
    );
  }
  let childLedgerTotalDrAmount = 0;
  let childLedgerTotalCrAmount = 0;

  for (const detail of input.multiVoucherDetails) {
    if (detail.id) {
      const existingDetail = await validateIdMultiVoucherDetails(detail.id);
      if (existingDetail.multiVoucherId !== input.id) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            "Multi Voucher Details",
            "Multi Voucher"
          )
        );
      }
    }
    const cc = await validateIdCollectionCenter(detail.ccId);
    if (cc.id === settings?.mainBranch?.id) {
      throw new ErrorHandler(
        400,
        "Multi Voucher Details cannot be created for head office "
      );
    }
    const ledger = await validateIdLedger(detail.ledgerId);
    if (ledger.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company")
      );
    }
    if (voucherType.isNarrationMandatory && !detail.narration) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Narration")
      );
    }
    if (
      voucherType.numberingMode === VoucherNumberingMode.MANUAL &&
      !detail.voucherNo
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Voucher No")
      );
    }

    if (Number(detail.amount) <= 0) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("MUST_GREATER_THEN", "Details Amount", "0")
      );
    }
    // check if transaction type is required
    if (voucherType.isTransactionTypeRequired && ledger.isBankAccount) {
      if (!detail.transactionType) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Transaction Type")
        );
      }
      if (detail.transactionType === BankTransactionType.CHEQUE) {
        const chequeNo = Number(detail.instrumentNo);

        const allChequeMasters =
          (await commonGetService.getAllElements<"ChequeMaster">({
            cacheCode: "CHEQUE_MASTER",
            canNullReturnable: true,
            modelName: "ChequeMaster",
            shortCode: "CHEQUE_MASTER",
            useActiveFlag: true,
          })) as ChequeMaster[];

        const chequeMaster = allChequeMasters.filter(
          (cm) => cm.bankLedgerId === ledger.id && cm.status === Status.ACTIVE
        );

        if (!chequeMaster) {
          throw new ErrorHandler(
            400,
            generateErrorMessage("NOT_FOUND", "Cheque Master")
          );
        }
        // Check that the provided chequeNo exists in any ChequeMaster range
        // If not, throw an error
        // const checkNumberExists = chequeMaster.some((cm) => chequeNo >= cm.startChequeNo && chequeNo <= cm.endChequeNo);
        const matchingChequeMaster = chequeMaster.find(
          (cm) => chequeNo >= cm.startChequeNo && chequeNo <= cm.endChequeNo
        );

        if (!matchingChequeMaster) {
          throw new ErrorHandler(
            404,
            `Cheque No ${chequeNo} does not exist in any Cheque Master range for bank ${ledger.name}`
          );
        }
        const checkNumberIsUsed = await checkChequeNumberIsUsed(
          matchingChequeMaster.id,
          chequeNo
        );
        if (checkNumberIsUsed) {
          throw new ErrorHandler(400, `Cheque No ${chequeNo} is already used`);
        }
      }
    }
    // if (input.drCr === DrCr.DR && detail.drCr !== DrCr.CR) {
    //   throw new ErrorHandler(400, "Child ledger must be CR");
    // } else if (input.drCr === DrCr.CR && detail.drCr !== DrCr.DR) {
    //   throw new ErrorHandler(400, "Child ledger must be DR");
    // }

    if (detail.drCr === DrCr.DR) {
      childLedgerTotalDrAmount += Number(detail.amount);
    } else {
      childLedgerTotalCrAmount += Number(detail.amount);
    }
  }

  // validate child ledger total amount
  if (
    input.drCr === DrCr.DR &&
    childLedgerTotalCrAmount - childLedgerTotalDrAmount !== Number(input.amount)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        `Parent Ledger ${parentLedger.name} Amount: ${input.amount}`,
        `Child Ledger Total Amount: ${
          childLedgerTotalCrAmount - childLedgerTotalDrAmount
        }`
      )
    );
  } else if (
    input.drCr === DrCr.CR &&
    childLedgerTotalDrAmount - childLedgerTotalCrAmount !== Number(input.amount)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        `Parent Ledger ${parentLedger.name} Amount: ${input.amount}`,
        `Child Ledger Total Amount: ${
          childLedgerTotalDrAmount - childLedgerTotalCrAmount
        }`
      )
    );
  }
  logger.info(
    "exiting::createOrUpdateMultiVoucherServiceValidation::service::validation"
  );
};

export const deleteMultiVoucherServiceValidation = async (id: number) => {
  logger.info(
    "entering::deleteMultiVoucherServiceValidation::service::validation"
  );
  const multiVoucher = await validateIdMultiVoucher(id);
  if (multiVoucher.status !== MultiVoucherStatus.DRAFT) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Multi Voucher")
    );
  }
  logger.info(
    "exiting::deleteMultiVoucherServiceValidation::service::validation"
  );
};

import { uinServiceFactory } from "@/config/core.config.js";
import { requestStorage } from "@/config/requestContext.js";
import { getByUnique } from "@/repository/common.repository.js";
import { getCostCentersByIds } from "@/repository/master/costCenter.repository.js";
import { getBillDocumentsByIds } from "@/repository/voucher/billDocument.repository.js";
import { getVoucherById } from "@/repository/voucher/voucher.repository.js";
import { commonGetService } from "@/services/common.service.js";
import { voucherUINConfigService } from "@/services/master/voucherUinConfig.service.js";
import { VoucherLineResponseForLedgerBook } from "@/types/reports/ledgerBook.js";
import {
  CreateOrUpdateVoucherInput,
  PostVoucherBillAllocationInput,
  PostVoucherCostCenterAllocationInput,
  VoucherResponse,
} from "@/types/voucher/voucher.js";
import { validIdCheck } from "@/validations/global.validation.js";
import { applyRound, RoundFormat } from "av6-utils";
import {
  validateIdCompany,
  validateIdFinancialYear,
} from "../company/company.service.validation.js";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";
import { validateIdCurrency } from "../master/currency.service.validation.js";
import { validateIdVoucherType } from "../master/voucherType.service.validation.js";
import { checkChequeNumberIsUsed } from "@/repository/master/chequeMaster.repository.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { settingsService } from "@/services/settings/settings.service.js";
import {
  AccUinShortCode,
  AllocationType,
  BankTransactionType,
  BillStatus,
  DrCr,
  Status,
  VoucherNumberingMode,
  VoucherStatus,
} from "@repo/db/generated/prisma/enums.js";
import {
  BillDocument,
  ChequeMaster,
  CostCenter,
  Ledger,
} from "@repo/db/generated/prisma/client";

export const validateIdVoucher = async (
  id: number
): Promise<VoucherResponse> => {
  logger.info("entering::validateIdVoucher::service::validation");

  validIdCheck(id);
  const voucher = await getVoucherById(id);

  if (!voucher) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Voucher"));
  }

  logger.info("exiting::validateIdVoucher::service::validation");

  return voucher;
};

export const validateIdVoucherLine = async (
  id: number
): Promise<VoucherLineResponseForLedgerBook> => {
  logger.info("entering::validateIdVoucherLine::service::validation");
  validIdCheck(id);
  const voucherLine = (await getByUnique<"VoucherLine">({
    model: "VoucherLine",
    where: {
      id,
      isActive: true,
    },
    args: {
      include: {
        voucher: true,
      },
    },
  })) as VoucherLineResponseForLedgerBook;
  if (!voucherLine) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Voucher Line")
    );
  }
  logger.info("exiting::validateIdVoucherLine::service::validation");
  return voucherLine;
};

export const createOrUpdateVoucherServiceValidation = async (params: {
  input: CreateOrUpdateVoucherInput;
  isCurrencyConversionRequired?: boolean;
}): Promise<CreateOrUpdateVoucherInput> => {
  logger.info("entering::createOrUpdateVoucher::service::validation");
  const { input, isCurrencyConversionRequired = true } = params;
  const store = requestStorage.getStore();
  const settings = await settingsService.getSettings();
  const roundingPrecision = settings?.roundingPrecision ?? 2;
  const roundingMethod = settings?.roundingMethod ?? RoundFormat.TO_FIXED;

  if (input.id) {
    const existingVoucher = await validateIdVoucher(input.id);
    input.voucherNo = existingVoucher.voucherNo;
    input.existing = existingVoucher;
    if (existingVoucher.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        "You can't change company for existing voucher"
      );
    }

    // if (existingVoucher.status !== VoucherStatus.DRAFT) {
    //   throw new ErrorHandler(400, generateErrorMessage("INVALID_STATUS", "Voucher"));
    // }
  }

  const company = await validateIdCompany(input.companyId);
  let currencyConversionRate: number = 1;
  if (input.currencyId) {
    const currency = await validateIdCurrency(input.currencyId);
    if (currency.id !== company.currencyId && !input.currencyConversionRate) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("FIELD_REQUIRED", "Currency Conversion Rate")
      );
    }
    currencyConversionRate = isCurrencyConversionRequired
      ? Number(input.currencyConversionRate ?? 1)
      : 1;
  }
  const fy = await validateIdFinancialYear(input.financialYearId);
  /**
   * Financial Year Validation
   * 1. Check if the financial year is current
   * 2. Check if the financial year is locked
   * 3. Check if the financial year is closed
   */
  if (!fy.isCurrent) {
    throw new ErrorHandler(400, "Please provide current financial year");
  }
  if (fy.isLocked) {
    throw new ErrorHandler(
      400,
      "Financial Year is locked, cannot create voucher"
    );
  }
  if (fy.isClosed) {
    throw new ErrorHandler(
      400,
      "Financial Year is closed, cannot create voucher"
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

  if (fy.companyId !== input.companyId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ASSOCIATION", "Financial Year", "Company")
    );
  }

  const cc = await validateIdCollectionCenter(input.ccId);
  if (cc.id === settings?.mainBranch?.id) {
    throw new ErrorHandler(400, "Voucher cannot be created for head office ");
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

  if (voucherType.isNarrationMandatory && !input.narration) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Narration")
    );
  }

  if (
    voucherType.numberingMode === VoucherNumberingMode.MANUAL &&
    !input.voucherNo
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("FIELD_REQUIRED", "Voucher Number")
    );
  }

  if (input.voucherLines.length < 2) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("ARRAY_LENGTH", "Voucher Line", "2")
    );
  }

  let voucherLineTotalCr: number = 0;
  let voucherLineTotalDr: number = 0;
  let hasBankOrCashLedger: boolean = false;
  let voucherLineTotalCrCurrencyAmount: number = 0;
  let voucherLineTotalDrCurrencyAmount: number = 0;

  const allLedgers = await commonGetService.getAllElements<"Ledger">({
    cacheCode: "LEDGER",
    canNullReturnable: true,
    modelName: "Ledger",
    shortCode: "LEDGER",
    useActiveFlag: true,
  });

  // Build a lineNo -> line data map (used for allocations validation)
  const byLineNo = new Map<
    number,
    {
      lineNo: number;
      ledgerId: number;
      drCr: DrCr;
      amount: number;
      ledger: Ledger;
    }
  >();
  const seenLineNos = new Set<number>();

  for (const voucherLine of input.voucherLines) {
    if (seenLineNos.has(voucherLine.lineNo)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("DUPLICATE_ITEM", "Voucher Line No")
      );
    }
    seenLineNos.add(voucherLine.lineNo);

    const ledger = allLedgers.find((l) => l.id === voucherLine.ledgerId);
    if (!ledger)
      throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Ledger"));

    if (ledger.companyId !== input.companyId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ASSOCIATION", "Ledger", "Company")
      );
    }

    const isBankOrCash = ledger.isBankAccount || ledger.isCashAccount;
    if (isBankOrCash) hasBankOrCashLedger = true;

    if (voucherType.contraOnlyBankOrCash && !isBankOrCash) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_ASSOCIATION",
          `Ledger ${ledger.name}`,
          "Contra Voucher (Bank/Cash only)"
        )
      );
    }

    // check if transaction type is required
    if (voucherType.isTransactionTypeRequired && ledger.isBankAccount) {
      if (!voucherLine.transactionType) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Transaction Type")
        );
      }
      if (!voucherLine.instrumentNo) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Instrument No")
        );
      }
      if (!voucherLine.instrumentDate) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_REQUIRED", "Instrument Date")
        );
      }
      if (voucherLine.transactionType === BankTransactionType.CHEQUE) {
        const chequeNo = Number(voucherLine.instrumentNo);

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
        if (
          checkNumberIsUsed &&
          voucherLine.id !== checkNumberIsUsed.voucherLineId
        ) {
          throw new ErrorHandler(400, `Cheque No ${chequeNo} is already used`);
        }
        input.usedChequeMasterId = matchingChequeMaster.id;
      }
    }
    if (voucherType.isTransactionTypeRequired && !ledger.isBankAccount) {
      if (voucherLine.transactionType) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Transaction Type")
        );
      }
      if (voucherLine.instrumentDate) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Instrument Date")
        );
      }
      if (voucherLine.instrumentNo) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Instrument No")
        );
      }
    }
    if (!voucherType.isTransactionTypeRequired) {
      if (voucherLine.transactionType) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Transaction Type")
        );
      }
      if (voucherLine.instrumentDate) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Instrument Date")
        );
      }
      if (voucherLine.instrumentNo) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("FIELD_NOT_ALLOWED", "Instrument No")
        );
      }
    }
    const amt = Number(voucherLine.amount);
    if (amt <= 0)
      throw new ErrorHandler(
        400,
        generateErrorMessage("MUST_GREATER_THEN", "Amount", "0")
      );

    voucherLine.currencyAmount =
      input.currencyId && input.currencyId !== company.currencyId
        ? voucherLine.amount
        : 0;

    //currency conversion
    if (voucherLine.drCr === DrCr.CR) {
      voucherLineTotalCr += amt * currencyConversionRate;
      voucherLineTotalCrCurrencyAmount += Number(voucherLine.currencyAmount);
    } else {
      voucherLineTotalDr += amt * currencyConversionRate;
      voucherLineTotalDrCurrencyAmount += Number(voucherLine.currencyAmount);
    }

    byLineNo.set(voucherLine.lineNo, {
      lineNo: voucherLine.lineNo,
      ledgerId: voucherLine.ledgerId,
      drCr: voucherLine.drCr,
      amount: amt * currencyConversionRate,
      ledger,
    });

    voucherLine.amount = applyRound(
      amt * currencyConversionRate,
      roundingMethod,
      roundingPrecision
    );
    voucherLine.currencyId = input.currencyId;
    voucherLine.currencyConversionRate = input.currencyConversionRate;
  }
  input.currencyTotalDebit = voucherLineTotalDrCurrencyAmount;
  input.currencyTotalCredit = voucherLineTotalCrCurrencyAmount;

  const totalDebit: number = applyRound(
    Number(input.totalDebit ?? 0) * currencyConversionRate,
    roundingMethod,
    roundingPrecision
  );
  const totalCredit: number = applyRound(
    Number(input.totalCredit ?? 0) * currencyConversionRate,
    roundingMethod,
    roundingPrecision
  );
  input.totalDebit = totalDebit;
  input.totalCredit = totalCredit;

  if (Number(input.totalDebit) <= 0 || Number(input.totalCredit) <= 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MUST_GREATER_THEN", "Total Debit/Credit", "0")
    );
  }
  if (voucherType.requireBankOrCash && !hasBankOrCashLedger) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_ASSOCIATION",
        "At least one Bank/Cash Ledger",
        "Voucher Type"
      )
    );
  }

  if (voucherLineTotalCrCurrencyAmount !== voucherLineTotalDrCurrencyAmount) {
    throw new ErrorHandler(
      400,
      "Total CR and DR amount before currency conversion should be equal for voucher lines"
    );
  }
  if (voucherLineTotalCr !== voucherLineTotalDr) {
    throw new ErrorHandler(
      400,
      "Total CR and DR should be equal for voucher lines"
    );
  }

  if (
    applyRound(voucherLineTotalCr, roundingMethod, roundingPrecision) !==
    Number(input.totalCredit)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Total Credit",
        "Voucher Lines total credit"
      )
    );
  }

  if (
    applyRound(voucherLineTotalDr, roundingMethod, roundingPrecision) !==
    Number(input.totalDebit)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "MISMATCH",
        "Total Debit",
        "Voucher Lines total debit"
      )
    );
  }

  // ==========================================================
  // CostCenterAllocation validation (service-level)
  // ==========================================================
  if (input.costCenterAllocations?.length) {
    // 1) validate association lineNo exists + group by lineNo
    const ccAllocByLineNo = new Map<
      number,
      PostVoucherCostCenterAllocationInput[]
    >();
    const costCenterIds = new Set<number>();

    for (const a of input.costCenterAllocations) {
      const line = byLineNo.get(a.lineNo);
      if (!line) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            "Cost Center Allocation",
            "Voucher Line"
          )
        );
      }

      // Optional strict: drCr must match voucher line
      if (a.drCr !== line.drCr) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            "Dr Cr",
            `Voucher Line ${a.lineNo} DrCr`
          )
        );
      }

      costCenterIds.add(a.costCenterId);
      (
        ccAllocByLineNo.get(a.lineNo) ??
        ccAllocByLineNo.set(a.lineNo, []).get(a.lineNo)!
      ).push(a);
    }

    // 2) fetch cost centers via repo (NO direct db calls)
    const ccRows = await getCostCentersByIds(input.companyId, [
      ...costCenterIds,
    ]);
    const ccMap = new Map<number, CostCenter>();
    ccRows.forEach((r) => ccMap.set(r.id, r));

    // 3) enforce sums only for lines where ledger.isCostCentreOn=true
    for (const line of byLineNo.values()) {
      if (!line.ledger.isCostCentreOn) continue;

      const allocs = ccAllocByLineNo.get(line.lineNo) ?? [];
      if (!allocs.length) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "FIELD_REQUIRED",
            `Cost Center Allocation for lineNo ${line.lineNo}`
          )
        );
      }

      let sumAlloc = 0;
      const seenCC = new Set<number>();

      for (const a of allocs) {
        if (seenCC.has(a.costCenterId)) {
          throw new ErrorHandler(
            400,
            generateErrorMessage(
              "DUPLICATE_ITEM",
              `Cost Center in lineNo ${line.lineNo}`
            )
          );
        }
        seenCC.add(a.costCenterId);

        const ccItem = ccMap.get(a.costCenterId);
        if (!ccItem)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Cost Center")
          );
        if (ccItem.companyId !== input.companyId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage(
              "INVALID_ASSOCIATION",
              "Cost Center",
              "Company"
            )
          );
        }
        if (ccItem.isActive === false || ccItem.status === "INACTIVE") {
          throw new ErrorHandler(400, "Cost Center is inactive");
        }

        const amt = Number(a.amount);
        if (amt <= 0)
          throw new ErrorHandler(
            400,
            generateErrorMessage("MUST_GREATER_THEN", "Amount", "0")
          );
        sumAlloc += amt;
      }

      if (
        applyRound(sumAlloc, roundingMethod, roundingPrecision) !==
        applyRound(line.amount, roundingMethod, roundingPrecision)
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Cost Center Allocation total for lineNo ${line.lineNo}`,
            "Voucher Line amount"
          )
        );
      }
    }
  }

  // ==========================================================
  // BillAllocation validation (service-level)
  // ==========================================================
  if (input.billAllocations?.length) {
    const billAllocByLineNo = new Map<
      number,
      PostVoucherBillAllocationInput[]
    >();
    const againstRefIds = new Set<number>();

    for (const a of input.billAllocations) {
      const line = byLineNo.get(a.lineNo);
      if (!line) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            "Bill Allocation",
            "Voucher Line"
          )
        );
      }

      // Party ledger should match voucher line ledger
      if (a.partyLedgerId !== line.ledgerId) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "INVALID_ASSOCIATION",
            "Party Ledger",
            `Voucher Line ${a.lineNo}`
          )
        );
      }

      // Optional strict: drCr must match voucher line drCr
      if (a.drCr !== line.drCr) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            "Dr Cr",
            `Voucher Line ${a.lineNo} DrCr`
          )
        );
      }

      // allocation type specific checks
      if (a.allocationType === AllocationType.NEW_REF) {
        if (!a.refNo)
          throw new ErrorHandler(
            400,
            generateErrorMessage("FIELD_REQUIRED", "Reference No")
          );
        if (!a.refDate)
          throw new ErrorHandler(
            400,
            generateErrorMessage("FIELD_REQUIRED", "Reference Date")
          );
        if (a.billDocumentId)
          throw new ErrorHandler(
            400,
            "Bill Document Id must be null for NEW_REF"
          );
      }

      if (a.allocationType === AllocationType.AGAINST_REF) {
        if (!a.billDocumentId)
          throw new ErrorHandler(
            400,
            generateErrorMessage("FIELD_REQUIRED", "Bill Document Id")
          );
        againstRefIds.add(a.billDocumentId);
      }

      if (a.allocationType === AllocationType.ON_ACCOUNT) {
        if (a.billDocumentId)
          throw new ErrorHandler(
            400,
            "Bill Document Id must be null for ON_ACCOUNT"
          );
      }

      const amt = Number(a.amount);
      if (amt <= 0)
        throw new ErrorHandler(
          400,
          generateErrorMessage("MUST_GREATER_THEN", "Amount", "0")
        );

      (
        billAllocByLineNo.get(a.lineNo) ??
        billAllocByLineNo.set(a.lineNo, []).get(a.lineNo)!
      ).push(a);
    }

    // Fetch referenced bill docs via repo (NO direct db calls)
    const billDocs = againstRefIds.size
      ? await getBillDocumentsByIds([...againstRefIds])
      : [];
    const billMap = new Map<number, BillDocument>();
    billDocs.forEach((b) => billMap.set(b.id, b));

    // For each bill-wise ledger line enforce sums and validate AGAINST_REF docs
    for (const line of byLineNo.values()) {
      if (!line.ledger.isBillWiseOn) continue;

      const allocs = billAllocByLineNo.get(line.lineNo) ?? [];
      if (!allocs.length) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "FIELD_REQUIRED",
            `Bill Allocations for lineNo ${line.lineNo}`
          )
        );
      }

      const sumAlloc = allocs.reduce((s, a) => s + Number(a.amount), 0);
      if (
        applyRound(sumAlloc, roundingMethod, roundingPrecision) !==
        applyRound(line.amount, roundingMethod, roundingPrecision)
      ) {
        throw new ErrorHandler(
          400,
          generateErrorMessage(
            "MISMATCH",
            `Bill Allocation total for lineNo ${line.lineNo}`,
            "Voucher Line amount"
          )
        );
      }

      for (const a of allocs) {
        if (a.allocationType !== AllocationType.AGAINST_REF) continue;

        const bill = billMap.get(a.billDocumentId as number);
        if (!bill)
          throw new ErrorHandler(
            404,
            generateErrorMessage("NOT_FOUND", "Bill Document")
          );

        // ownership & association checks
        if (bill.companyId !== input.companyId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage(
              "INVALID_ASSOCIATION",
              "Bill Document",
              "Company"
            )
          );
        }
        if (bill.financialYearId !== input.financialYearId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage(
              "INVALID_ASSOCIATION",
              "Bill Document",
              "Financial Year"
            )
          );
        }
        if (bill.partyLedgerId !== a.partyLedgerId) {
          throw new ErrorHandler(
            400,
            generateErrorMessage(
              "INVALID_ASSOCIATION",
              "Bill Document",
              "Party Ledger"
            )
          );
        }
        const allowed: BillStatus[] = [BillStatus.OPEN, BillStatus.PARTIAL];

        if (!allowed.includes(bill.status)) {
          throw new ErrorHandler(400, "Bill document is not open/partial");
        }

        const remaining = Number(bill.amount) - Number(bill.adjustedAmount);
        if (Number(a.amount) > remaining) {
          throw new ErrorHandler(400, "Bill document cannot be over-adjusted");
        }
      }
    }
  }

  if (
    voucherType.numberingMode === VoucherNumberingMode.AUTO &&
    !input.voucherNo
  ) {
    input.voucherNo = await uinServiceFactory.generateUIN(
      AccUinShortCode.VOUCHER
    );
  } else if (
    voucherType.numberingMode === VoucherNumberingMode.CUSTOM_AUTO &&
    !input.voucherNo
  ) {
    input.voucherNo = await voucherUINConfigService.generateUIN(
      input.voucherTypeId,
      new Date(input.voucherDate)
    );
  }
  logger.info("exiting::createOrUpdateVoucher::service::validation");
  return input;
};

export const deleteVoucherServiceValidation = async (
  id: number
): Promise<void> => {
  logger.info("entering::deleteVoucher::service::validation");
  const voucher = await validateIdVoucher(id);
  if (voucher.status !== VoucherStatus.DRAFT) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Voucher")
    );
  }
  logger.info("exiting::deleteVoucher::service::validation");
};

export const cancelVoucherServiceValidation = async (
  id: number
): Promise<void> => {
  logger.info("entering::cancelVoucher::service::validation");
  const voucher = await validateIdVoucher(id);
  if (voucher.status !== VoucherStatus.POSTED) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Voucher")
    );
  }
  logger.info("exiting::cancelVoucher::service::validation");
};

export const createVoucherFromExcelServiceValidation = async (params: {
  filePath: string;
  ccId: number;
  voucherTypeId: number;
}) => {
  logger.info(
    "entering::createVoucherFromExcelServiceValidation::service::validation"
  );
  if (!params.filePath) {
    throw new ErrorHandler(400, "No file path provided");
  }
  const settings = await settingsService.getSettings();
  const cc = await validateIdCollectionCenter(params.ccId);
  if (cc.id === settings?.mainBranch?.id) {
    throw new ErrorHandler(400, "Voucher cannot be created for head office ");
  }

  await validateIdVoucherType(params.voucherTypeId);
  logger.info(
    "exiting::createVoucherFromExcelServiceValidation::service::validation"
  );
};

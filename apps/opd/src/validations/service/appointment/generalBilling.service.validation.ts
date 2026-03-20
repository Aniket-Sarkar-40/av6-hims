import { requestStorage } from "@repo/platform/config/requestContext.js";
import {
  getGeneralBillingByIdFromDb,
  getGeneralBillingDetailsByIdFromDb,
} from "@/repository/appointment/generalBilling.repository.js";
import {
  GeneralBillingCreateInput,
  GeneralBillingForValidation,
  GeneralBillingReturnInput,
  GeneralBillingUpdateInput,
  isUpdateInput,
} from "@/types/appointment/generalBilling.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@/validations/global.validation.js";
import {
  GeneralBillingDetails,
  PaymentStatus,
  GeneralBillingStatus,
  PercentageOrAmount,
} from "@repo/db/generated/prisma/client";
import {
  calculateBillingFromChildren,
  ChildCalcInput,
  MasterAdditionalDiscount,
} from "av6-utils";
import { validateIdGeneralBillItem } from "../master/generalBillItem.service.validation.js";
import { validateIdPatients } from "../patient/patient.service.validation.js";

export const validateIdGeneralBilling = async (id: number) => {
  logger.info("entering::validateIdGeneralBilling::service::validation");
  validIdCheck(id);
  const response = await getGeneralBillingByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "General Billing"),
    );
  }
  logger.info("exiting::validateIdGeneralBilling::service::validation");
  return response;
};

export const validateIdGeneralBillingDetails = async (id: number) => {
  logger.info("entering::validateIdGeneralBillingDetails::service::validation");
  validIdCheck(id);
  const response = await getGeneralBillingDetailsByIdFromDb(id);
  if (!response) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "General Billing Details"),
    );
  }
  logger.info("exiting::validateIdGeneralBillingDetails::service::validation");
  return response;
};

export const commonGeneralBillingServiceValidation = async (
  input: GeneralBillingForValidation,
) => {
  const settings = requestStorage.getStore()?.settings;
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const calculationMethod = settings?.grnCalculationMethod || "STEP_WISE";

  const childCalcInputArray: ChildCalcInput[] = [];

  const patient = await validateIdPatients(input.patientId);

  input.patientUniqueId = patient.patientUniqueId;

  for (const detail of input.generalBillingDetails) {
    const { generalBillItemId } = detail;
    await validateIdGeneralBillItem(generalBillItemId);
    if (detail.id && isUpdateInput(input)) {
      const generalBillingDetails = input.existing.generalBillingDetails.find(
        (e) => e.id === detail.id,
      );
      if (!generalBillingDetails) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("NOT_FOUND", "General Billing Details"),
        );
      }
    }
    // preparing child calculation Input
    const clildCalcInput: ChildCalcInput = {
      qty: 1,
      rate: detail.subtotalAmount ?? 0,
      discountMode: detail.discountMode ?? undefined,
      discountValue: detail.discountValue,
      taxMethod: detail.taxMethod ?? undefined,
      taxValue: detail.taxValue,
    };

    childCalcInputArray.push(clildCalcInput);
  }

  //preparing master data for calculation

  const masterAdditionalCalcInput: MasterAdditionalDiscount = {
    mode: input.additionalDiscountMode ?? PercentageOrAmount.PERCENTAGE,
    value: input.additionalDiscountValue ?? 0,
    coPayMode: "PERCENTAGE-AMOUNT",
  };

  //Caluculation function
  const calcOutput = calculateBillingFromChildren(
    childCalcInputArray,
    masterAdditionalCalcInput,
    {
      calculationMethod:
        calculationMethod === "STEP_WISE" ? "STEP_WISE" : "FINAL_ONLY",
      lineRound: roundFormat,
      headerRound: roundFormat,
      precision: precision,
    },
  );

  const { master, children } = calcOutput;

  // Validating child data

  for (let i = 0; i < children.length; i++) {
    const calData = children[i];
    const inputData = input.generalBillingDetails[i];

    if (inputData.subtotalAmount !== calData.subtotalAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Subtotal Amount (${inputData.subtotalAmount}) and calculated Subtotal Amount (${calData.subtotalAmount}) for details ${inputData.generalBillItemId}`,
        ),
      );
    }

    if (inputData.discountAmount !== calData.discountAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Discount Amount (${inputData.discountAmount}) and calculated Discount Amount (${calData.discountAmount}) for details ${inputData.generalBillItemId}`,
        ),
      );
    }

    if (inputData.taxAmount !== calData.taxAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Tax Amount (${inputData.taxAmount}) and calculated Tax Amount (${calData.taxAmount}) for details ${inputData.generalBillItemId}`,
        ),
      );
    }
    if (inputData.grossAmount !== calData.grossAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Gross Amount (${inputData.grossAmount}) and calculated Gross Amount (${calData.grossAmount}) for details ${inputData.generalBillItemId}`,
        ),
      );
    }

    if (inputData.netAmount !== calData.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Amount (${inputData.netAmount}) and calculated Net Amount (${calData.netAmount}) for Procedure for details ${inputData.generalBillItemId}`,
        ),
      );
    }
  }
  // Validating master data

  if (input.subtotalAmount !== master.subtotalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Subtotal Amount (${input.subtotalAmount}) and calculated Subtotal Amount (${master.subtotalAmount})`,
      ),
    );
  }

  if (input.discountTotalAmount !== master.discountTotalAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Discount Total Amount (${input.discountTotalAmount}) and calculated Discount Total Amount (${master.discountTotalAmount})`,
      ),
    );
  }

  if (input.taxAmount !== master.taxAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Tax Amount (${input.taxAmount}) and calculated Tax Amount (${master.taxAmount})`,
      ),
    );
  }

  if (input.grossAmount !== master.grossAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Gross Amount (${input.grossAmount}) and calculated Gross Amount (${master.grossAmount})`,
      ),
    );
  }

  if (input.netAmount !== master.netAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Amount (${input.netAmount}) and calculated Net Amount (${master.netAmount})`,
      ),
    );
  }
};

export const createGeneralBillingServiceValidation = async (
  input: GeneralBillingCreateInput,
) => {
  logger.info("entering::createGeneralBilling::service::validation");

  await commonGeneralBillingServiceValidation(input);

  logger.info("exiting::createGeneralBilling::service::validation");
};

export const updateGeneralBillingServiceValidation = async (
  input: GeneralBillingUpdateInput,
) => {
  logger.info("entering::updateGeneralBilling::service::validation");
  const existing = await validateIdGeneralBilling(input.id);
  input.existing = existing;

  if (input.ccId !== existing.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  if (
    existing.paymentStatus &&
    existing.paymentStatus !== PaymentStatus.PENDING
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "General Billing"),
    );
  }

  await commonGeneralBillingServiceValidation(input);

  logger.info("exiting::updateGeneralBilling::service::validation");
};

export const returnGeneralBillingServiceValidation = async (
  input: GeneralBillingReturnInput,
) => {
  logger.info("entering::returnGeneralBilling::service::validation");

  const settings = requestStorage.getStore()?.settings;
  const roundFormat = settings?.grnRoundedFormat || "TO_FIXED";
  const precision = settings?.defaultPrecision || 2;
  const calculationMethod = settings?.grnCalculationMethod || "STEP_WISE";

  const childCalcInputArray: ChildCalcInput[] = [];

  const existing = await validateIdGeneralBilling(input.id);
  input.existing = existing;
  if (input.ccId !== existing.ccId) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  const gbDetailsNotReturned: GeneralBillingDetails[] =
    existing.generalBillingDetails.filter(
      (detail) => detail.isRefunded === false,
    );
  if (input.detailId.length < gbDetailsNotReturned.length) {
    existing.status = GeneralBillingStatus.PARTIAL;
  }
  if (input.detailId.length === gbDetailsNotReturned.length) {
    existing.status = GeneralBillingStatus.CANCELLED;
  }

  for (const detail of input.detailId) {
    const details = await validateIdGeneralBillingDetails(detail);
    if (details.generalBillingId !== input.id) {
      throw new ErrorHandler(
        400,
        `General Billing Details with id ${detail} not exist for General Billing with id ${input.id}`,
      );
    }

    // preparing child calculation Input
    const clildCalcInput: ChildCalcInput = {
      qty: 1,
      rate: details.subtotalAmount ?? 0,
      discountMode: details.discountMode ?? undefined,
      discountValue: details.discountValue,
      taxMethod: details.taxMethod ?? undefined,
      taxValue: details.taxValue,
    };

    childCalcInputArray.push(clildCalcInput);
  }

  //preparing master data for calculation

  const masterAdditionalCalcInput: MasterAdditionalDiscount = {
    mode: existing.additionalDiscountMode ?? PercentageOrAmount.PERCENTAGE,
    value: existing.additionalDiscountValue ?? 0,
    coPayMode: "PERCENTAGE-AMOUNT",
  };

  //Caluculation function
  const calcOutput = calculateBillingFromChildren(
    childCalcInputArray,
    masterAdditionalCalcInput,
    {
      calculationMethod:
        calculationMethod === "STEP_WISE" ? "STEP_WISE" : "FINAL_ONLY",
      lineRound: roundFormat,
      headerRound: roundFormat,
      precision: precision,
    },
  );

  const { master } = calcOutput;
  existing.subtotalAmount -= master.subtotalAmount;
  existing.otherChargeAmount -= master.otherChargeAmount;
  existing.discountTotalAmount -= master.discountTotalAmount;
  existing.taxAmount -= master.taxAmount;
  existing.grossAmount -= master.grossAmount;
  existing.netAmount -= master.netAmount;

  const actlCustomerPayAmt = existing.paidAmount - existing.refundedAmount;
  const diff = existing.netAmount - actlCustomerPayAmt;
  if (diff > 0) {
    if (actlCustomerPayAmt > 0) {
      existing.paymentStatus = PaymentStatus.PARTIAL;
    } else {
      existing.paymentStatus = PaymentStatus.PENDING;
    }
  } else if (diff < 0) {
    existing.refundAmount = Math.abs(diff);
    existing.paymentStatus = PaymentStatus.REFUND;
  } else {
    existing.paymentStatus = PaymentStatus.SETTLED;
  }
  logger.info("existing::returnGeneralBilling::service::validation");
};

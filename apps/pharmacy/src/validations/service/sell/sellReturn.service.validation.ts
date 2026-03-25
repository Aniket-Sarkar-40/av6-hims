import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import {
  getCorporateClientById,
  getCorporateClientPaymentSettings,
} from "@/repository/opd/corporate.repository.js";
import {
  getCountSellReturnDetailsFromDb,
  getSellReturnByIdFromDb,
  getSellReturnTotalsBySellId,
} from "@/repository/sell/sellReturn.repository.js";
import { SellReturnInput } from "@/types/sell/sellReturn.js";
import {
  CalculationMethod,
  PaymentModePharmacy,
  RETURN_STS,
  RETURN_STS_SELL,
} from "@repo/db/generated/prisma/enums.js";
import { Decimal } from "@repo/db/generated/prisma/internal/prismaNamespace.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validateIdInsurance } from "../insurance/insurance.service.validation.js";
import { validateIdPatientsInsurance } from "../insurance/patientInsurance.service.validation.js";
import { validateIdPatients } from "../insurance/patients.service.validation.js";
import { validateIdItem } from "../item/item.service.validation.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateIdEmployee } from "../staff/employee.service.validation.js";
import { validateIdSell } from "./sell.service.validation.js";
import { settingsService } from "@/services/master/settings.service.js";
import { DOC_DESG_ID } from "@repo/shared";
import { CalculationInput } from "@repo/platform/types/common.js";
import { applyRound } from "av6-utils";
import { calculation } from "@/utils/commonCalculation.utils.js";

export const validateIdSellReturn = async (id: number) => {
  logger.info("entering::validateIdSellReturn service::validation");
  validIdCheck(id);
  const sellReturn = await getSellReturnByIdFromDb(id);
  if (!sellReturn) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Sell Return"),
    );
  }
  logger.info("exiting::validateIdSellReturn::service::validation");

  return sellReturn;
};

export const validateIdSellReturnDetails = async (input: SellReturnInput) => {
  const detailIds = input.sellReturnDetails
    .map((d) => d.id)
    .filter((id): id is number => id != null);

  if (detailIds.length > 0) {
    const count = await getCountSellReturnDetailsFromDb(detailIds, input.id!);
    if (count !== detailIds.length) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Sell Return details"),
      );
    }
  }
};

export const commonSellReturnServiceValidation = async (
  input: SellReturnInput,
): Promise<void> => {
  logger.info(
    "entering::commonSellReturnServiceValidation::service::validation",
  );

  const branch = await validateIdBranch(input.ccId);
  if (input.staffId) await validateIdEmployee(input.staffId);
  const patient = await validateIdPatients(input.customerId);
  input.patient = patient;
  const doctor = await validateIdEmployee(input.doctorId);
  if (input.corporateClientId) {
    const client = await getCorporateClientById(input.corporateClientId);
    if (!client) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Corporate Client"),
      );
    }
    input.client = client;
  }

  const settings = await settingsService.getSettings();
  const calculationMethod: CalculationMethod =
    settings?.sellCalculationMethod || "STEP_WISE";
  const roundFormat = settings?.sellRoundedFormat || "ROUND";
  const precision = settings?.sellPrecision ?? settings?.defaultPrecision ?? 2;
  const finalRoundFormat = settings?.sellFinalRoundedFormat || "SPECIAL_ROUND";

  if (doctor.designation != DOC_DESG_ID) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Doctor"));
  }

  const sell = await validateIdSell(input.sellId);
  input.sell = sell;

  if (input.insuranceId) {
    await validateIdInsurance(input.insuranceId);
  }
  if (input.patientInsuranceId) {
    await validateIdPatientsInsurance(input.patientInsuranceId);
  }

  if (sell.ccId !== input.ccId && branch.isMain === false) {
    throw new ErrorHandler(404, generateErrorMessage("ACCESS_FAIL"));
  }

  if (sell.sellRefNo !== input.sellNumber) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Sell Number", "Sending Sell Number"),
    );
  }

  if (sell.id !== input.sellId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Sell ID", "Sending Sell Id"),
    );
  }

  if (sell.status !== "COMPLETED" && sell.status !== "PARTIALLY_RETURNED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Sell ID"),
    );
  }

  let totalInsuredCoPayAmount = 0;
  let totalCompleteReturnQuantity = 0;
  sell.sellDetails.forEach((sellDetail) => {
    const alreadyReturnedQty = sellDetail.returnQuantity;
    const currentSellReturn = input.sellReturnDetails.find(
      (d) => d.sellDetailsId === sellDetail.id,
    );
    const currentReturnQty = currentSellReturn ? currentSellReturn.quantity : 0;
    const finalReturnQty = alreadyReturnedQty + currentReturnQty;
    if (finalReturnQty === sellDetail.quantity) {
      totalCompleteReturnQuantity += 1;
    }
  });

  if (totalCompleteReturnQuantity === sell.sellDetails.length) {
    input.isCompleteReturn = true;
  } else {
    input.isCompleteReturn = false;
  }

  let allItemTotalAmount = 0;
  for (const item of input.sellReturnDetails) {
    const itemDetails = await validateIdItem(item.itemId);
    if (!itemDetails) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", `Item Id:${item.itemId}`),
      );
    }
    if (itemDetails.isReturnable === false) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NON_RETURNABLE", `${itemDetails.medicineName}`),
      );
    }
    const medicineName = itemDetails.medicineName;

    const sellDetail = sell.sellDetails.find(
      (sellItem) => sellItem.id === item.sellDetailsId,
    );

    if (!sellDetail) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Sell Details"),
      );
    }
    const finalQuantity = sellDetail.quantity - sellDetail.returnQuantity;

    if (item.quantity !== undefined && item.quantity > finalQuantity) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "INVALID_VALUE",
          `Item ${itemDetails.medicineName}: Quantity in Sell (${item.quantity}) exceeds return quantity (${finalQuantity}) in Sell Return`,
        ),
      );
    }
    //Need to check
    if (item.sellQuantity !== sellDetail.quantity) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Sell Return Sell Quantity (${item.sellQuantity}) does not match with Sell Details Quantity (${sellDetail.quantity}) for Item Id:${itemDetails.medicineName}`,
        ),
      );
    }

    const itemAmount = item.mrp * item.quantity;
    if (applyRound(itemAmount, roundFormat, precision) !== item.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Amount (${item.netAmount}) does not match calculated item net amount (${applyRound(itemAmount, roundFormat, precision)}) for Item :${itemDetails.medicineName}`,
        ),
      );
    }

    const calculationInput: CalculationInput = {
      amount: itemAmount ?? 0,
      discountMethod: item.discountMethod,
      discount: item.discount ?? 0,
      taxMethod: item.taxMethod,
      tax: item.tax ?? 0,
      calculationMethod,
      precision,
      roundFormat,
    };
    const result = calculation(calculationInput);

    if (
      applyRound(result.netDiscount, roundFormat, precision) !==
      item.netDiscount
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Discount (${item.netDiscount}) does not match calculated net discount (${applyRound(result.netDiscount, roundFormat, precision)}) for Item Id:${medicineName}`,
        ),
      );
    }
    if (applyRound(result.netTax, roundFormat, precision) !== item.netTax) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Tax (${item.netTax}) does not match calculated net tax (${applyRound(result.netTax, roundFormat, precision)}) for Item Id:${medicineName})`,
        ),
      );
    }
    if (
      applyRound(result.totalAmount, roundFormat, precision) !==
      item.totalAmount
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Total Amount (${item.totalAmount}) does not match calculated total (${applyRound(result.totalAmount, roundFormat, precision)}) for Item Id:${medicineName}`,
        ),
      );
    }

    const insurancePricing = input.insuranceId
      ? await getInsurancePricing(input.insuranceId, input.ccId, itemDetails.id)
      : null;

    const corporateClientPricing = input.corporateClientId
      ? await getCorporateClientPaymentSettings(
          input.corporateClientId,
          input.ccId,
          item.itemId,
        )
      : null;

    let unitCoPay = null;
    if (sellDetail.coPayPaymentValue && sellDetail.coPayPaymentType) {
      unitCoPay =
        sellDetail.coPayPaymentType === PaymentModePharmacy.co_pay
          ? applyRound(
              (sellDetail.mrp.toNumber() *
                Number(sellDetail.coPayPaymentValue)) /
                100,
              settings?.sellRoundedFormat ?? "TO_FIXED",
              settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
            )
          : Number(sellDetail.coPayPaymentValue);
    } else if (insurancePricing) {
      unitCoPay =
        insurancePricing.paymentMode === PaymentModePharmacy.co_pay
          ? applyRound(
              (sellDetail.mrp.toNumber() *
                Number(insurancePricing.paymentValue)) /
                100,
              settings?.sellRoundedFormat ?? "TO_FIXED",
              settings?.sellPrecision ?? settings?.defaultPrecision ?? 2,
            )
          : Number(insurancePricing.paymentValue);
    }

    const corporatePaymentValue = sellDetail.coPayPaymentValue
      ? Number(sellDetail.coPayPaymentValue)
      : corporateClientPricing?.paymentMode === "Include"
        ? 100
        : null;
    const corporatePaymentMode = sellDetail.coPayPaymentType
      ? sellDetail.coPayPaymentType
      : corporateClientPricing?.paymentMode === "Include"
        ? "co_pay"
        : null;

    let itemCoPay = 0;
    if (input.insuranceId && unitCoPay) {
      itemCoPay = unitCoPay * item.quantity;
    } else if (
      input.corporateClientId &&
      corporatePaymentMode &&
      corporatePaymentValue
    ) {
      itemCoPay =
        corporatePaymentMode === PaymentModePharmacy.co_pay
          ? (item.totalAmount * corporatePaymentValue) / 100
          : corporatePaymentValue * item.quantity;
    }

    item.coPayPaymentType = sellDetail.coPayPaymentType;
    item.coPayPaymentValue = sellDetail.coPayPaymentValue;

    itemCoPay = applyRound(itemCoPay, roundFormat, precision);

    if (itemCoPay !== item.coPayAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Insurance co-pay (${item.coPayAmount}) does not match calculated item co-pay amount (${itemCoPay}) for Item :${medicineName}`,
        ),
      );
    }

    let itemPatientPay = item.totalAmount - itemCoPay;
    itemPatientPay = applyRound(itemPatientPay, roundFormat, precision);

    if (itemPatientPay !== item.customerPayAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Patient pay amount (${item.customerPayAmount}) does not match calculated item pay amount (${itemPatientPay}) for Item :${medicineName}`,
        ),
      );
    }
    allItemTotalAmount += item.totalAmount;
    totalInsuredCoPayAmount += itemCoPay;
  }

  const sellReturnHeadResult = calculation({
    amount: input.netAmount ?? 0,
    discountMethod: input.discountMethod,
    discount: input.discount ?? 0,
    taxMethod: input.taxMethod,
    tax: input.tax ?? 0,
    calculationMethod,
    precision,
    roundFormat,
  });

  if (
    applyRound(allItemTotalAmount, roundFormat, precision) !== input.netAmount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Header Net Amount (${input.netAmount}) does not match calculated items total (${applyRound(allItemTotalAmount, roundFormat, precision)})`,
      ),
    );
  }

  if (
    applyRound(sellReturnHeadResult.netDiscount, roundFormat, precision) !==
    input.netDiscount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Discount (${input.netDiscount}) does not match calculated net discount (${applyRound(sellReturnHeadResult.netDiscount, roundFormat, precision)})`,
      ),
    );
  }
  if (
    applyRound(sellReturnHeadResult.netTax, roundFormat, precision) !==
    input.netTax
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Tax (${input.netTax}) does not match calculated net tax (${applyRound(sellReturnHeadResult.netTax, roundFormat, precision)})`,
      ),
    );
  }
  if (
    applyRound(
      sellReturnHeadResult.totalAmount,
      finalRoundFormat,
      precision,
    ) !== input.totalAmount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total Amount (${input.totalAmount}) does not match calculated total (${applyRound(sellReturnHeadResult.totalAmount, finalRoundFormat, precision)})`,
      ),
    );
  }
  totalInsuredCoPayAmount = applyRound(
    totalInsuredCoPayAmount,
    finalRoundFormat,
    precision,
  );
  if (totalInsuredCoPayAmount !== input.coPayAmount) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total co-pay amount (${input.coPayAmount}) does not match calculated total co-pay amount (${totalInsuredCoPayAmount})`,
      ),
    );
  }

  const patientPayAmount = input.totalAmount - totalInsuredCoPayAmount;
  if (
    applyRound(patientPayAmount, finalRoundFormat, precision) !==
    input.customerPayAmount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total patient pay amount (${input.customerPayAmount}) does not match calculated total patient pay amount (${applyRound(patientPayAmount, finalRoundFormat, precision)})`,
      ),
    );
  }

  logger.info(
    "exiting::commonSellReturnServiceValidation::service::validation",
  );
};

export const approveSellReturnServiceValidation = async (
  input: SellReturnInput,
): Promise<void> => {
  logger.info(
    "entering::approveSellReturnServiceValidation::service::validation",
  );
  if (input.id === undefined) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Sell Return ID is required"),
    );
  }
  const sellReturn = await validateIdSellReturn(input.id);
  if (sellReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Sell Return"),
    );
  }
  await validateIdSellReturnDetails(input);

  await commonSellReturnServiceValidation(input);

  const { totalCoPayAmount, totalCustomerPayAmount } =
    await getSellReturnTotalsBySellId(input.sellId);
  input.totalCoPayAmount = totalCoPayAmount + input.coPayAmount;
  input.totalCustomerPayAmount =
    totalCustomerPayAmount + input.customerPayAmount;
  const sell = input.sell;

  const customerAlreadyPaidAmount =
    sell.paidAmount.toNumber() - sell.refundedAmount.toNumber();
  const adjustedCustomerPayAmount =
    sell.customerPayAmount.toNumber() - input.totalCustomerPayAmount;

  const diffOfCustomerPay =
    customerAlreadyPaidAmount - adjustedCustomerPayAmount;
  input.refundAmount = Math.max(0, diffOfCustomerPay);

  if (diffOfCustomerPay > 0) {
    sell.paymentStatus = "REFUND";
  } else if (diffOfCustomerPay < 0) {
    sell.paymentStatus =
      sell.paidAmount.toNumber() > 0 ? "PARTIALLY_PAID" : "UNPAID";
  } else {
    sell.paymentStatus = "PAID";
  }

  logger.info(
    "exiting::approveSellReturnServiceValidation::service::validation",
  );
};
export const createSellReturnServiceValidation = async (
  input: SellReturnInput,
): Promise<void> => {
  logger.info(
    "entering::createSellReturnServiceValidation::service::validation",
  );
  const sell = await validateIdSell(input.sellId);

  if (sell.returnStatus === RETURN_STS_SELL.PENDING) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Sell Return"),
    );
  }

  await commonSellReturnServiceValidation(input);

  logger.info(
    "exiting::createSellReturnServiceValidation::service::validation",
  );
};
export const updateSellReturnServiceValidation = async (
  input: SellReturnInput,
): Promise<void> => {
  logger.info("entering::updateSellReturn::service::validation");

  if (input.id === undefined) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Sell Return ID is required"),
    );
  }
  const sellReturn = await validateIdSellReturn(input.id);
  input.existingSellReturn = sellReturn;

  const updatedIds: number[] = input.sellReturnDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in stock transfer details
  const existingIds = sellReturn.sellReturnDetails.map((item) => item.id);
  // check if any item is not in stock transfer details
  const notInSellReturnDetails = updatedIds.filter(
    (id) => !existingIds.includes(id),
  );
  if (notInSellReturnDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInSellReturnDetails.join(", ")} of Stock Transfer Details`,
      ),
    );
  }

  await commonSellReturnServiceValidation(input);

  logger.info("exiting::updateSellReturn::service::validation");
};

export const rejectSellReturnServiceValidation = async (body: {
  id: number;
  sellId: number;
}) => {
  logger.info("entering::rejectSellReturn::service::validation");
  if (body.id === undefined) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Sell Return ID is required"),
    );
  }
  const sellReturn = await validateIdSellReturn(body.id);
  if (sellReturn.status !== "PENDING") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Sell Return"),
    );
  }
  if (body.sellId !== sellReturn.sellId) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Sell ID", "Sending Sell Id"),
    );
  }

  logger.info("exiting::rejectSellReturn::service::validation");
};

export const deleteSellReturnServiceValidation = async (id: number) => {
  logger.info(
    "entering::deleteSellReturnServiceValidation::service::validation",
  );

  const sellReturn = await validateIdSellReturn(id);

  if (sellReturn.status !== RETURN_STS.PENDING) {
    logger.error(
      `Cannot delete Sell return with id=${id} in status=${sellReturn.status}`,
    );
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Sell return"),
    );
  }
  logger.info(
    "exiting::deleteSellReturnServiceValidation::service::validation",
  );
};

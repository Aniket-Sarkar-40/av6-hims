import { getInsurancePricing } from "@/repository/insurance/insurancePaymentSettings.repository.js";
import { getCountItemsFromDb } from "@/repository/item/item.repository.js";
import {
  getItemBranchMapByItemAndBranchIdFromDb,
  getMappedItemIdsForBranch,
} from "@/repository/item/itemBranchMap.repository.js";
import { getBankHeadByIdFromDb } from "@/repository/master/bankHead.repository.js";
import { getMobileMoneyMethodByIdFromDb } from "@/repository/master/mobileMoney.repository.js";
import {
  getCorporateClientById,
  getCorporateClientPaymentSettings,
} from "@/repository/opd/corporate.repository.js";
import { valSellByIdFromDb } from "@/repository/sell/sell.repository.js";
import {
  getSellReturnTotalsBySellDetailsId,
  getSellReturnTotalsBySellId,
} from "@/repository/sell/sellReturn.repository.js";
import { getItemStockQtyByBatchWise } from "@/repository/stock/stock.repository.js";
import {
  SellCoPaySetInput,
  SellInput,
  SellPaymentInput,
  SellStockAdjustmentInput,
} from "@/types/sell/sell.js";
import {
  CalculationMethod,
  INCLUDE_EXCLUDE,
  PaymentModePharmacy,
  SELL_STATUS,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import { validateIdInsurance } from "../insurance/insurance.service.validation.js";
import { validateIdPatientsInsurance } from "../insurance/patientInsurance.service.validation.js";
import { validateIdPatients } from "../insurance/patients.service.validation.js";
import { validateIdBranch } from "../master/branch.service.validation.js";
import { validateIdEmployee } from "../staff/employee.service.validation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { settingsService } from "@/services/master/settings.service.js";
import { DOC_DESG_ID } from "@repo/shared";
import { applyRound } from "av6-utils";
import { CalculationInput } from "@repo/platform/types/common.js";
import { calculation } from "@/utils/commonCalculation.utils.js";
//Validate Id Sell
export const validateIdSell = async (id: number) => {
  logger.info("entering::validateIdSell service::validation");
  validIdCheck(id);
  const sell = await valSellByIdFromDb(id);
  if (!sell) {
    throw new ErrorHandler(404, generateErrorMessage("NOT_FOUND", "Sell"));
  }
  logger.info("exiting::validateIdSell::service::validation");
  return sell;
};

// Create Sell service function
export const createSellServiceValidation = async (
  input: SellInput,
): Promise<void> => {
  logger.info("entering::createSellServiceValidation::service::validation");

  // Validation start
  await validateIdBranch(input.ccId);
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
    if (input.coPayAmount > 0) {
      const isAllowed = await externalService.validateCorporateAmount(
        client.id,
        input.coPayAmount,
      );
      if (!isAllowed) {
        throw new ErrorHandler(
          400,
          generateErrorMessage("CREDIT_LIMIT_EXCEEDED", "Corporate Client"),
        );
      }
    }
    input.client = client;
  }

  const settings = await settingsService.getSettings();
  const calculationMethod: CalculationMethod =
    settings?.sellCalculationMethod || "STEP_WISE";
  const roundFormat = settings?.sellRoundedFormat || "TO_FIXED";
  const precision = settings?.sellPrecision ?? settings?.defaultPrecision ?? 2;
  const finalRoundFormat = settings?.sellFinalRoundedFormat || "SPECIAL_ROUND";

  if (doctor.designation != DOC_DESG_ID) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_ID", "Doctor"));
  }

  if (input.insuranceId) {
    await validateIdInsurance(input.insuranceId);
  }

  if (input.patientInsuranceId) {
    const patIns = await validateIdPatientsInsurance(input.patientInsuranceId);
    if (input.insuranceId && patIns.insurerId !== input.insuranceId) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_ID", "Patient Insurance"),
      );
    }
  }

  const itemIds = input.sellDetails.map((c) => c.itemId);

  const items = await getCountItemsFromDb(itemIds);

  const mappedIds = await getMappedItemIdsForBranch(input.ccId, itemIds);
  const unmappedIds = [...new Set(itemIds)].filter(
    (id) => !mappedIds.some((item) => item.itemId === id),
  );
  if (unmappedIds.length) {
    const names = unmappedIds
      .map((id) => items.find((x) => x.id === id)?.medicineName ?? `ID:${id}`)
      .join(", ");
    throw new ErrorHandler(404, `Item Branch Map not found for: ${names}`);
  }

  let totalInsuredCoPayAmount = 0;

  // Validation foir each item
  let allItemTotalAmount = 0;
  for (const item of input.sellDetails) {
    //Check if item exists
    const itemDetails = items.find((it) => it.id === item.itemId);
    if (!itemDetails) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("NOT_FOUND", `Item Id:${item.itemId}`),
      );
    }

    const insurancePricing = input.insuranceId
      ? await getInsurancePricing(input.insuranceId, input.ccId, itemDetails.id)
      : null;

    const itemBranchPricing = !insurancePricing
      ? await getItemBranchMapByItemAndBranchIdFromDb({
          branchId: input.ccId,
          itemId: item.itemId,
        })
      : null;

    const corporateClientPricing = input.corporateClientId
      ? await getCorporateClientPaymentSettings(
          input.corporateClientId,
          input.ccId,
          item.itemId,
        )
      : null;

    // const saleAmount = itemBranchPricing?.saleAmount ? itemBranchPricing.saleAmount : itemDetails.saleAmount;
    let saleAmount = itemDetails.saleAmount.toNumber();
    let insurancePercentage = itemDetails.insurancePercentage.toNumber();
    const corporateClientPaymentMode = corporateClientPricing?.paymentMode;

    if (insurancePricing) {
      saleAmount = Number(insurancePricing.mrp);
      insurancePercentage = Number(insurancePricing.insurancePercentage);
    } else if (itemBranchPricing) {
      saleAmount = itemBranchPricing?.saleAmount
        ? itemBranchPricing.saleAmount.toNumber()
        : itemDetails.saleAmount.toNumber();
      insurancePercentage = itemBranchPricing?.insurancePercentage
        ? itemBranchPricing.insurancePercentage.toNumber()
        : itemDetails.insurancePercentage.toNumber();
    }

    const walkInPercentage = itemBranchPricing?.walkInPercentage
      ? itemBranchPricing.walkInPercentage.toNumber()
      : itemDetails.walkInPercentage.toNumber();

    const onHoldSale = itemBranchPricing?.onHoldSale
      ? itemBranchPricing.onHoldSale
      : itemDetails.onHoldSale;

    const medicineName = itemDetails.medicineName;

    if (onHoldSale && onHoldSale > new Date()) {
      throw new ErrorHandler(
        400,
        `Medicine ${medicineName} sale is hold till ${dayjs(onHoldSale).format(ISO_DATE_FORMAT)}.`,
      );
    }

    let calMrp = saleAmount;
    //Validate MRP based on delivery type
    if (input.insuranceId || input.corporateClientId) {
      calMrp = saleAmount + (saleAmount * insurancePercentage) / 100;
    } else {
      calMrp = saleAmount + (saleAmount * walkInPercentage) / 100;
    }

    if (applyRound(calMrp, roundFormat, precision) !== item.mrp) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `MRP does not match calculated MRP for Item :${medicineName}`,
        ),
      );
    }

    let itemAmount = item.mrp * item.quantity;
    itemAmount = applyRound(itemAmount, roundFormat, precision);
    if (itemAmount !== item.netAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "VALUE_MISMATCH",
          `Net Amount (${item.netAmount}) does not match calculated item amount (${itemAmount}) for Item :${medicineName}`,
        ),
      );
    }
    let itemCoPay = 0;
    if (insurancePricing) {
      itemCoPay = insurancePricing?.coPay
        ? Number(insurancePricing.coPay) * item.quantity
        : 0;
      item.coPayPaymentType = insurancePricing.paymentMode;
      item.coPayPaymentValue = insurancePricing.paymentValue;
      item.coPaySource = "settings";
    } else if (corporateClientPricing) {
      itemCoPay =
        corporateClientPaymentMode === INCLUDE_EXCLUDE.Exclude
          ? 0
          : item.totalAmount;
      item.coPayPaymentType = PaymentModePharmacy.co_pay;
      item.coPayPaymentValue = new Decimal(100);
      item.coPaySource = "settings";
    }

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

    // Check if item stock is available and sufficient
    const stock = await getItemStockQtyByBatchWise(
      item.itemId,
      { branchId: input.ccId },
      item.batchNo,
      new Date(item.expiryDate),
    );

    if (stock === undefined || stock < item.quantity) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INSUFFICIENT_STOCK", `Item :${medicineName}`),
      );
    }

    // Prepare CalculationInput object for item
    const calculationInput: CalculationInput = {
      amount: itemAmount,
      discountMethod: item.discountMethod,
      discount: item.discount,
      taxMethod: item.taxMethod,
      tax: item.tax,
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

  //Validation for overall amount
  const sellHeadResult = calculation({
    amount: input.netAmount,
    discountMethod: input.discountMethod,
    discount: input.discount,
    taxMethod: input.taxMethod,
    tax: input.tax,
    calculationMethod,
    precision,
    roundFormat,
  });

  // Check if items total matches header total
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
    applyRound(sellHeadResult.netDiscount, roundFormat, precision) !==
    input.netDiscount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Discount (${input.netDiscount}) does not match calculated net discount (${applyRound(sellHeadResult.netDiscount, roundFormat, precision)})`,
      ),
    );
  }
  if (
    applyRound(sellHeadResult.netTax, roundFormat, precision) !== input.netTax
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Net Tax (${input.netTax}) does not match calculated net tax (${applyRound(sellHeadResult.netTax, roundFormat, precision)})`,
      ),
    );
  }
  if (
    applyRound(sellHeadResult.totalAmount, finalRoundFormat, precision) !==
    input.totalAmount
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "VALUE_MISMATCH",
        `Total Amount (${input.totalAmount}) does not match calculated total (${applyRound(sellHeadResult.totalAmount, finalRoundFormat, precision)})`,
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

  const paidAmount = input.paidAmount ?? 0;

  if (input.customerPayAmount <= paidAmount) {
    input.paymentStatus = "PAID";
  } else if (input.customerPayAmount > paidAmount && paidAmount > 0) {
    input.paymentStatus = "PARTIALLY_PAID";
  } else {
    input.paymentStatus = "UNPAID";
  }

  logger.info("exiting::createSellServiceValidation::service::validation");
};

export const updateSellStatusServiceValidation = async (input: SellInput) => {
  logger.info(
    "entering::updateSellStatusServiceValidation::service::validation",
  );
  if (input.id === undefined) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Sell  ID is required"),
    );
  }
  const sell = await validateIdSell(input.id);
  input.existingSell = sell;

  if (sell.status === "COMPLETED") {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_FIELD", "Status"),
    );
  }

  const updatedIds: number[] = input.sellDetails
    .filter((d) => typeof d.id === "number")
    .map((d) => d.id as number)
    .filter((id): id is number => id !== undefined);
  //check if any item is not in Sell details
  const existingIds = sell.sellDetails.map((item) => item.id);
  const notInSellDetails = updatedIds.filter((id) => !existingIds.includes(id));
  if (notInSellDetails.length > 0) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_FIELD",
        `Id ${notInSellDetails.join(", ")} of Stock Transfer Details`,
      ),
    );
  }
  await createSellServiceValidation(input);
  logger.info(
    "exiting::updateSellStatusServiceValidation::service::validation",
  );
};

export const deleteSellServiceValidation = async (id: number) => {
  logger.info("entering::deleteSellServiceValidation::service::validation");

  const sell = await validateIdSell(id);

  if (sell.status !== SELL_STATUS.DRAFT) {
    logger.error(`Cannot delete Sell  with id=${id} in status=${sell.status}`);
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_STATUS", "Sell "),
    );
  }
  logger.info("exiting::deleteSellServiceValidation::service::validation");
};

export const sellStockAdjustServiceValidation = async (
  input: SellStockAdjustmentInput,
) => {
  logger.info("entering::sellStockAdjust::service::validation");

  const feature = await featureFlagService.getFeatureFlagByShortCode(
    "SELL_STOCK_ADJ",
    true,
  );

  if (feature && feature.isEnabled === true) {
    const existing = await sellService.getSellById(input.id);

    if (
      !["COMPLETED", "PARTIALLY_RETURNED"].includes(existing.status) ||
      existing.isStockAdjusted === true
    )
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_STATUS", "Sell"),
      );
    input.sell = existing;
    // for stock checking and throw error msg if insufficient stock
    const errorMessages: string[] = [];
    for (const detail of existing.sellDetails) {
      const stock = await getItemStockQtyByBatchWise(
        detail.itemId,
        { branchId: existing.ccId },
        detail.batchNo,
        new Date(detail.expiryDate),
      );
      if (!stock || stock < detail.quantity) {
        errorMessages.push(
          generateErrorMessage(
            "INSUFFICIENT_STOCK",
            `Item: ${detail.item?.medicineName} Batch: ${detail.batchNo}`,
          ),
        );
      }
    }
    if (errorMessages.length > 0) {
      throw new ErrorHandler(400, errorMessages.join(".\n"));
    }
  } else {
    return false;
  }
  logger.info("exiting::sellStockAdjust::service::validation");
  return true;
};

export const sellPaymentServiceValidation = async (input: SellPaymentInput) => {
  logger.info("entering::sellPayment::service::validation");
  const { ccId, sellId, paymentType, totalPaidAmount, paymentMethod } = input;

  const branch = await validateIdBranch(ccId);
  if (!branch.isAutonomous) {
    throw new ErrorHandler(403, generateErrorMessage("ACCESS_FAIL"));
  }

  const sell = await validateIdSell(sellId);
  if (sell.ccId !== ccId) {
    throw new ErrorHandler(400, generateErrorMessage("ACCESS_FAIL"));
  }

  const validations: Promise<unknown>[] = [];

  for (const m of paymentMethod) {
    if (m.paymentHeadId) {
      validations.push(
        (async () => {
          const head = await getBankHeadByIdFromDb(m.paymentHeadId as number);
          if (!head)
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Payment Head"),
            );
        })(),
      );
    }
    if (m.onlineMethod) {
      validations.push(
        (async () => {
          const method = await getMobileMoneyMethodByIdFromDb(
            m.onlineMethod as number,
          );
          if (!method)
            throw new ErrorHandler(
              404,
              generateErrorMessage("NOT_FOUND", "Online Method"),
            );
        })(),
      );
    }
  }

  await Promise.all(validations);

  const splitSum = paymentMethod.reduce(
    (s, m) => s + Number(m.paidAmount || 0),
    0,
  );
  if (Math.abs(splitSum - Number(totalPaidAmount)) > 0.009) {
    throw new ErrorHandler(
      400,
      `Sum of split amounts (${splitSum.toFixed(2)}) must equal total amount (${Number(totalPaidAmount).toFixed(2)})`,
    );
  }

  if (paymentType === "payment") {
    if (sell.paymentStatus === "PAID") {
      throw new ErrorHandler(400, "Sell is already paid");
    }
    const { totalCustomerPayAmount } =
      await getSellReturnTotalsBySellId(sellId);
    const adjustedCustomerPayAmount = Math.max(
      sell.customerPayAmount.toNumber() -
        totalCustomerPayAmount -
        sell.paidAmount.toNumber(),
      0,
    );
    if (adjustedCustomerPayAmount === 0) {
      throw new ErrorHandler(400, "Sell is already paid");
    }
    if (
      Number(adjustedCustomerPayAmount.toFixed(2)) !==
      Number(totalPaidAmount.toFixed(2))
    ) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("MISMATCH", "Total amount", "Paid amount"),
      );
    }
  } else {
    if (sell.returnedAmount.toNumber() < totalPaidAmount) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Paid amount"),
      );
    }
  }

  logger.info("exiting::sellPayment::service::validation");
};

export const sellCoPaySetServiceValidation = async (
  input: SellCoPaySetInput,
) => {
  logger.info("entering::sellCoPaySet::service::validation");
  const sell = await validateIdSell(input.sellId);
  if (sell.paymentStatus === "PAID") {
    throw new ErrorHandler(400, "Sell is already paid");
  }
  if (sell.corporateClientId && sell.patientInsuranceId && sell.insuranceId) {
    throw new ErrorHandler(
      400,
      " Sell without insurance not allowed to set co-pay",
    );
  }
  if (sell.sellRefNo !== input.sellRefNo) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("MISMATCH", "Sell ID", "Sell Reference No"),
    );
  }
  const matchSellDetail = sell.sellDetails.find(
    (d) => d.id === input.sellDetailsId,
  );

  if (!matchSellDetail) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_ID", "Sell Details ID"),
    );
  }

  if (
    input.coPayMode === "PERCENT" &&
    (input.coPayValue < 0 || input.coPayValue > 100)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Co-pay Value"),
    );
  }

  const { totalCustomerPayAmount } = await getSellReturnTotalsBySellDetailsId(
    input.sellDetailsId,
  );
  const adjustedCustomerPayAmount = Math.max(
    matchSellDetail.customerPayAmount.toNumber() - totalCustomerPayAmount,
    0,
  );

  if (
    input.coPayMode === "AMOUNT" &&
    (input.coPayValue < 0 || input.coPayValue > adjustedCustomerPayAmount)
  ) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("INVALID_VALUE", "Co-pay Value"),
    );
  }
  logger.info("exiting::sellCoPaySet::service::validation");
};

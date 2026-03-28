import { CalculationInput, CalculationRes } from "@/types/common.js";
import { DiscMethod } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { applyRound } from "av6-utils";

export const calculation = (input: CalculationInput): CalculationRes => {
  logger.info("entering::calculation::service::validation");

  let actualAmount = input.amount;
  let discountValue = 0;
  const calculationMethod = input.calculationMethod;
  const roundFormat = input.roundFormat;

  //* Calculate actual amount
  // if (input.taxMethod === "INCLUSIVE") {
  //   const inclusiveTaxMultiplier = (100 + input.tax) / 100;
  //   actualAmount = input.amount / inclusiveTaxMultiplier;
  // }
  actualAmount =
    calculationMethod === "STEP_WISE"
      ? applyRound(actualAmount, roundFormat, input.precision)
      : actualAmount;

  //* calculate discount value
  if (input.discountMethod === DiscMethod.FIXED) {
    discountValue = input.discount;
  } else if (input.discountMethod === DiscMethod.PERCENTAGE) {
    discountValue = (actualAmount * input.discount) / 100;
  }
  discountValue =
    calculationMethod === "STEP_WISE"
      ? applyRound(discountValue, roundFormat, input.precision)
      : discountValue;

  // * After discount amount
  let afterDisc = actualAmount - discountValue;
  afterDisc =
    calculationMethod === "STEP_WISE"
      ? applyRound(afterDisc, roundFormat, input.precision)
      : afterDisc;

  //* Calculate Tax
  let calculatedTax = (input.tax * afterDisc) / 100;

  calculatedTax =
    calculationMethod === "STEP_WISE"
      ? applyRound(calculatedTax, roundFormat, input.precision)
      : calculatedTax;

  //* amount after tax (total amount)
  let totalAmount = afterDisc + calculatedTax;
  totalAmount =
    calculationMethod === "STEP_WISE"
      ? applyRound(totalAmount, roundFormat, input.precision)
      : totalAmount;

  logger.info("exiting::calculateDiscountAndTax::service::validation");

  return {
    netDiscount: discountValue,
    netTax: calculatedTax,
    totalAmount,
  };
};

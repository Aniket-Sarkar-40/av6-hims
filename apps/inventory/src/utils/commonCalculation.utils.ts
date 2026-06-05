import { CalculationInput, CalculationRes } from "@/types/common.js";
import {
  CalculationMethod,
  DiscMethod,
  ItemStockType,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
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
    calculationMethod === CalculationMethod.STEP_WISE
      ? applyRound(actualAmount, roundFormat, input.precision)
      : actualAmount;

  //* calculate discount value
  if (input.discountMethod === DiscMethod.FIXED) {
    discountValue = input.discount;
  } else if (input.discountMethod === DiscMethod.PERCENTAGE) {
    discountValue = (actualAmount * input.discount) / 100;
  }
  discountValue =
    calculationMethod === CalculationMethod.STEP_WISE
      ? applyRound(discountValue, roundFormat, input.precision)
      : discountValue;

  // * After discount amount
  let afterDisc = actualAmount - discountValue;
  afterDisc =
    calculationMethod === CalculationMethod.STEP_WISE
      ? applyRound(afterDisc, roundFormat, input.precision)
      : afterDisc;

  //* Calculate Tax
  let calculatedTax = (input.tax * afterDisc) / 100;

  calculatedTax =
    calculationMethod === CalculationMethod.STEP_WISE
      ? applyRound(calculatedTax, roundFormat, input.precision)
      : calculatedTax;

  //* amount after tax (total amount)
  let totalAmount = afterDisc + calculatedTax;
  totalAmount =
    calculationMethod === CalculationMethod.STEP_WISE
      ? applyRound(totalAmount, roundFormat, input.precision)
      : totalAmount;

  logger.info("exiting::calculateDiscountAndTax::service::validation");

  return {
    netDiscount: discountValue,
    netTax: calculatedTax,
    totalAmount,
  };
};

export const calculateGrnItemNetAmount = ({
  itemStockType,
  unitDefaultValue,
  purchasedPrice,
  quantity,
  calculationMethod,
  roundFormat,
  precision,
}: {
  itemStockType: ItemStockType;
  unitDefaultValue: number;
  purchasedPrice: number;
  quantity: number;
  calculationMethod: CalculationMethod;
  roundFormat: RoundFormat;
  precision: number;
}) => {
  const price = Number(purchasedPrice);
  const qty = Number(quantity);
  const defaultValue = Number(unitDefaultValue ?? 1);

  const amount =
    itemStockType === ItemStockType.EACH_WISE
      ? defaultValue * price * qty
      : price * qty;

  return calculationMethod === CalculationMethod.STEP_WISE
    ? applyRound(amount, roundFormat, precision)
    : amount;
};

export const calculateGrnStockQty = ({
  itemStockType,
  unitDefaultValue,
  quantity,
}: {
  itemStockType: ItemStockType;
  unitDefaultValue: number;
  quantity: number;
}) => {
  const qty = Number(quantity);
  const defaultValue = Number(unitDefaultValue ?? 1);

  return itemStockType === ItemStockType.EACH_WISE ? qty * defaultValue : qty;
};

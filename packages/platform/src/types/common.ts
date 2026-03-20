import {
  CalculationMethod,
  PercentageOrAmount,
  RoundFormat,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";

export interface BaseCoreResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errorMessage?: string;
}
export interface CollectionCenterApiRow {
  id: number;
  name: string;
}

export interface CalculationRes {
  netDiscount: number;
  netTax: number;
  totalAmount: number;
}

export interface CalculationInput {
  amount: number;
  discountMethod: PercentageOrAmount;
  discount: number;
  taxMethod: TAX_METHOD;
  tax: number;

  calculationMethod: CalculationMethod;
  roundFormat: RoundFormat;
  precision: number;
}

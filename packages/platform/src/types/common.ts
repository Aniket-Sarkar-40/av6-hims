import {
  CalculationMethod,
  PercentageOrAmount,
  Prisma,
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

export type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number
  : T extends (infer U)[]
    ? DecimalToNumber<U>[]
    : T extends object
      ? { [K in keyof T]: DecimalToNumber<T[K]> }
      : T;

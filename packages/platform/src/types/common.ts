import {
  CalculationMethod,
  DiscMethod,
  RoundFormat,
  TAX_METHOD,
} from "@repo/db/generated/prisma/client";

// Single source of truth lives in @repo/shared; re-exported here for the many
// existing `@repo/platform/types/common` consumers.
export type { DecimalToNumber } from "@repo/shared/utils/helper.utils.js";

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
  discountMethod: DiscMethod;
  discount: number;
  taxMethod: TAX_METHOD;
  tax: number;

  calculationMethod: CalculationMethod;
  roundFormat: RoundFormat;
  precision: number;
}

export interface ItemResponse {
  success: boolean;
  data: ItemData;
  message: string;
  errorMessage?: string;
}

export interface ItemData {
  id: number;
  itemNumber: string;
  medicineName: string;
  purchaseAmount: number;
  saleAmount: number;
  medPackingType: string;
  insurancePercentage: number;
  walkInPercentage: number;
  branchInHandStock: number;
  warehouseInHandStock: number | null;
  insuredCoPay: number | null;
  insuredPatientPay: number | null;
  corporateClientPaymentMode: string | null;
  tax: number;
  taxMethod: "INCLUSIVE" | "EXCLUSIVE";
  medCategory: CommonReference | null;
  medType: CommonReference | null;
  medComp: CommonReference | null;
  medUnit: CommonReference | null;
  packSize: CommonReference | null;
  drugType: CommonReference | null;
  medManufacturer: CommonReference | null;
  boxSize: CommonReference | null;
  storage: CommonReference | null;
}

export interface CommonReference {
  id: number;
  name: string;
}

export interface GetItemReq {
  id: number;
  warehouseId?: number;
  branchId?: number;
  insuranceId?: number;
  corporateClientId?: number;
  isZeroQty: boolean;
  isCustomPricing: boolean;
  isItemBranchMap?: boolean;
}

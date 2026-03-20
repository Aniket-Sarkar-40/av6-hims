export interface GetSellReq {
  sellId: number;
  sellRefNo: string;
  ccId: number;
}

export interface SellDetails {
  id: number;
  sellRefNo: string;
  billDate: Date;
  netAmount: number;
  discount: number;
  netDiscount: number;
  tax: number;
  netTax: number;
  totalAmount: number;
  paidAmount: number;
  returnedAmount: number;
  totalReturnedAmount: number | null;
  coPayAmount: number;
  customerPayAmount: number;
}

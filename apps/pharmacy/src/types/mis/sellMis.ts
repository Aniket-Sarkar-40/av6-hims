import { CommonFilterWithDate } from "av6-core-v2";

export interface SellInformation {
  id: number;
  date: Date;
  sellNo: string;
  aptNo: string;
  billNo: string | null;
  patientName: string;
  mobileNo: string;
  email: string;
  doctorName: string;
  insuranceName: string;
  corporateName: string;
  totalQty: number;
  saleItems: string;
  deliveryType: string;
  status: string;
  grossAmount: number;
  coPayAmount: number;
  customerPayAmount: number;
  returnGrossAmount: number;
  returnCoPayAmount: number;
  returnCustomerPayAmount: number;
  adjustedGrossAmount: number;
  adjustedCoPayAmount: number;
  adjustedCustomerPayAmount: number;
  adjustedDiscountAmount: number;
  paidAmount: number;
  refundedAmount: number;
  dueOrSettled: number;
}

export interface SellInformationFilters extends CommonFilterWithDate {
  ccId?: number;
  status?: string;
  patientId?: number;
  doctorId?: number;
}

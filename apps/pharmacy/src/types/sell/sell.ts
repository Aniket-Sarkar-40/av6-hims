import {
  ClientMaster,
  MedCategory,
  Patient,
  PmsItem,
  PmsSellDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import {
  BILL_FOR,
  CoPaymentSource,
  DeliveryType,
  DiscMethod,
  INCLUDE_EXCLUDE,
  PAYMENT_STATUS,
  PaymentMode,
  PaymentModePharmacy,
  RETURN_STS_SELL,
  SELL_PAYMENT_STATUS,
  SELL_STATUS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { Decimal } from "@repo/db/generated/prisma/internal/prismaNamespace.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";
import { IdValue } from "@repo/shared/types/global.js";
import { EmployeeCache } from "av6-core";

export interface SellInput {
  id?: number;
  ccId: number;
  staffId?: number | null;
  aptId?: number | null;
  aptNo?: string | null;
  deliveryType: DeliveryType;
  paymentMode?: PaymentMode | null;
  isHomeDelivery?: boolean;
  billDate?: Date;
  customerId: number;
  billingFor: BILL_FOR;
  insuranceId?: number | null;
  patientInsuranceId?: number | null;
  corporateClientId?: number | null;
  doctorId: number;
  netAmount: number;

  discountMethod: DiscMethod;
  discount: number;
  netDiscount: number;
  discountNote: string | null;

  taxMethod: TAX_METHOD;
  tax: number;
  netTax: number;
  returnStatus: RETURN_STS_SELL | null;

  totalAmount: number;
  coPayAmount: number;
  customerPayAmount: number;

  paidAmount?: number | null;
  paymentStatus?: PAYMENT_STATUS | null;
  status?: SELL_STATUS | null;
  sellDetails: SellDetailInput[];
  isPrint?: boolean;

  existingSell: ValSellResponse;
  patient: Patient | null;
  client: ClientMaster | null;
}

export interface SellDetailInput {
  id?: number;
  sellId?: number;
  itemId: number;
  itemCategoryName: string;
  medType: string;
  medComp: string;
  medUnit: string;
  manufacturer: string;
  packSize: string;
  drugType: string;
  itemCategoryId: number;
  medTypeId: number;
  medCompId: number;
  medUnitId: number;
  manufacturerId: number;
  packSizeId: number;
  drugTypeId: number;

  batchNo: string;
  isFoc: boolean;
  expiryDate: Date;
  mrp: number;
  quantity: number;
  netAmount: number;

  discountMethod: DiscMethod;
  discount: number;
  netDiscount: number;

  taxMethod: TAX_METHOD;
  tax: number;
  netTax: number;
  totalAmount: number;
  coPayAmount: number;
  customerPayAmount: number;

  coPayPaymentValue?: Decimal;
  coPayPaymentType?: PaymentModePharmacy;
  coPaySource?: CoPaymentSource;
}

export interface CalculationInput {
  netAmount: number;
  discountMethod: DiscMethod;
  discount: number;
  taxMethod: TAX_METHOD;
  tax: number;
}

export interface CalculationOutput {
  totalAmount: number;
  netDiscount: number;
  netTax: number;
}

export interface SellDTO extends Omit<
  SellResponse,
  | "createdBy"
  | "sellDetails"
  | "insurance"
  | "corporateClient"
  | "coPayAmount"
  | "customerPayAmount"
  | "netAmount"
  | "totalAmount"
  | "tax"
  | "netTax"
  | "discount"
  | "netDiscount"
  | "paidAmount"
  | "returnedAmount"
  | "refundedAmount"
> {
  staff?: EmployeeCache | null;
  insurance?: IdValue | null;
  corporateClient?: IdValue | null;
  createdBy: EmployeeCache | null;
  sellDetails: SellDetailDTO[];
  coPayAmount: number;
  customerPayAmount: number;
  netAmount: number;
  totalAmount: number;
  tax: number;
  netTax: number;
  discount: number;
  netDiscount: number;
  paidAmount: number;
  returnedAmount: number;
  refundedAmount: number;
  isSellCompleted: boolean;
}

export interface SellDtoForReceipt extends SellDTO {
  paymentTransaction: PaymentTransaction | null;
  appointment?: Appointment | null;
}

export interface Appointment {
  id: number;
  billId: number;
  bookedBy: number;
  referredBy: number;
  visitId: number;
  vipType: string;
}

export interface PaymentTransaction {
  id: number;
  paymentMode: string;
  paymentType: "Credit" | "Debit" | "Process";
  collectorName: string;
  collectorId: number;
  transactionDate: Date;
  paidAmount?: number;
  refundAmount?: number;
}

export interface SellDetailDTO extends Omit<
  PmsSellDetails,
  | "mrp"
  | "netAmount"
  | "totalAmount"
  | "coPayAmount"
  | "customerPayAmount"
  | "discount"
  | "netDiscount"
  | "tax"
  | "netTax"
  | "coPayPaymentValue"
> {
  item: DecimalToNumber<PmsItem> | null;
  itemCategory: MedCategory | null;
  insuredCoPay: number | null;
  insuredPatientPay: number | null;
  corporatePaymentMode: PaymentModePharmacy | null;
  corporatePaymentValue: number | null;
  corporateClientPaymentMode: INCLUDE_EXCLUDE | null;
  coPayPaymentValue?: number | null;
  coPayAmount: number;
  customerPayAmount: number;
  netAmount: number;
  totalAmount: number;
  discount: number;
  netDiscount: number;
  tax: number;
  netTax: number;
  mrp: number;
}

export type SellResponse = Prisma.PmsSellGetPayload<{
  include: {
    sellDetails: true;
    cc: true;
    customer: true;
    doctor: {
      select: {
        id: true;
        name: true;
        surname: true;
        designation: true;
        employeeId: true;
        department: true;
        email: true;
      };
    };
    insurance: true;
    corporateClient: true;
  };
}>;

export type SellDetailsResponseBase = Prisma.PmsSellDetailsGetPayload<{
  include: {
    sell: true;
  };
}>;

export interface SellDetailsResponse extends SellDetailsResponseBase {
  item: DecimalToNumber<PmsItem> | null;
}

export type SellByRefNoResponse = Prisma.PmsSellGetPayload<{
  include: {
    sellDetails: true;
  };
}>;

export type ValSellResponse = Prisma.PmsSellGetPayload<{
  include: {
    sellDetails: true;
  };
}>;

export interface sellExcelFilter {
  id?: number;
  sellRefNo?: string;
  branchId?: number;
  staffId?: number;
  deliveryType?: DeliveryType;
  paymentMode?: PaymentMode;
  isHomeDelivery?: boolean;
  startDate?: Date;
  endDate?: Date;
  customerId?: number;
  billingFor?: BILL_FOR;
  doctorId?: number;
}

export interface PrinterResponse {
  receipt: string;
  printerName: string;
}

export interface SellStockAdjustmentInput {
  id: number;
  type: "SELL" | "SELL_RETURN";
  sell: SellDTO;
}
export interface UpdateSellCopayInputCommon {
  id: number;
  coPay: number;
  patientPay: number;
  netAmount: number;
  netTax: number;
  netDiscount: number;
  totalAmount: number;
}

export interface UpdateSellCopayInputDetail extends UpdateSellCopayInputCommon {
  mrp: number;
}

export interface UpdateSellCopayInput extends UpdateSellCopayInputCommon {
  refundAmount: number;
  sellRefNo: string;
  paymentStatus?: SELL_PAYMENT_STATUS;
  clientId?: number | null;
  insurerId?: number | null;
  clientPlan?: string;
  details: UpdateSellCopayInputDetail[];
}

export interface SellPaymentInput {
  ccId: number;
  sellId: number;
  paymentMethod: PaymentMethods[];
  paymentType: "payment" | "refund";
  totalPaidAmount: number;
}

export interface SellCoPaySetInput {
  sellId: number;
  sellRefNo: string;
  sellDetailsId: number;
  coPayMode: "AMOUNT" | "PERCENT";
  coPayValue: number;
}

export interface PaymentMethods {
  method: "Cash" | "Card" | "Online" | "Cheque";
  paidAmount: number;
  paymentHeadId?: number | null;
  cardHolderName?: string;
  cardNo?: string;
  expiry?: string;
  bankName?: string;
  accountNumber?: string;
  transactionId?: string;
  onlineMethod?: number | null;
}

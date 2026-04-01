import {
  BILL_FOR,
  DeliveryType,
  DiscMethod,
  INCLUDE_EXCLUDE,
  PAYMENT_STATUS,
  PaymentModePharmacy,
  PmsPaymentMode,
  RETURN_STS,
  TAX_METHOD,
} from "@repo/db/generated/prisma/enums.js";
import { EmployeeCache } from "../staff/employee.js";
import {
  ClientMaster,
  MedCategory,
  Patient,
  PmsItem,
  PmsSell,
  PmsSellReturnDetails,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { Decimal } from "@repo/db/generated/prisma/internal/prismaNamespace.js";
import { IdValue } from "@repo/shared/types/global.js";
import { DecimalToNumber } from "@repo/platform/types/common.js";

export interface SellReturnInput {
  id?: number;
  ccId: number;
  sellId: number;
  sellNumber: string;
  staffId?: number | null;
  aptId?: number | null;
  aptNo?: string | null;
  deliveryType: DeliveryType;
  paymentMode?: PmsPaymentMode | null;
  isHomeDelivery?: boolean;
  billDate: Date;
  customerId: number;
  billingFor: BILL_FOR;
  insuranceId?: number | null;
  patientInsuranceId?: number | null;
  corporateClientId?: number | null;
  doctorId: number;

  returnDate?: Date;

  discountMethod: DiscMethod;
  discount?: number;
  netDiscount?: number;
  discountNote?: string | null;

  taxMethod: TAX_METHOD;
  tax?: number;
  netTax?: number;

  netAmount: number;
  totalAmount: number;
  paidAmount?: number;
  creditNoteNo?: string | null;
  coPayAmount: number;
  customerPayAmount: number;

  paymentStatus?: PAYMENT_STATUS;
  status?: RETURN_STS;

  sellReturnDetails: SellReturnDetailInput[];

  existingSellReturn: ValSellReturnResponse;
  patient: Patient | null;
  client: ClientMaster | null;
  isCompleteReturn: boolean;
  refundAmount: number;
  totalCustomerPayAmount: number;
  totalCoPayAmount: number;
  sell: PmsSell;
}

export interface SellReturnDetailInput {
  id?: number;
  itemId: number;
  sellDetailsId: number;
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
  sellQuantity: number;
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

  coPayPaymentType?: PaymentModePharmacy | null;
  coPayPaymentValue?: Decimal | null;
}

export type SellReturnResponse = Prisma.PmsSellReturnGetPayload<{
  include: {
    sellReturnDetails: {
      include: {
        sellDetails: {
          select: {
            returnQuantity: true;
          };
        };
      };
    };
    cc: true;
    customer: true;
    insurance: true;
    corporateClient: true;
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
  };
}>;

export type ValSellReturnResponse = Prisma.PmsSellReturnGetPayload<{
  include: {
    sellReturnDetails: true;
  };
}>;

export interface SellReturnDTO
  extends Omit<
    SellReturnResponse,
    | "createdBy"
    | "approvedBy"
    | "rejectedBy"
    | "insurance"
    | "corporateClient"
    | "discount"
    | "tax"
    | "netDiscount"
    | "netTax"
    | "paidAmount"
    | "netAmount"
    | "totalAmount"
    | "customerPayAmount"
    | "coPayAmount"
    | "sellReturnDetails"
  > {
  tax: number;
  netTax: number;
  discount: number;
  netDiscount: number;
  paidAmount: number;
  netAmount: number;
  totalAmount: number;
  customerPayAmount: number;
  coPayAmount: number;
  staff?: EmployeeCache | null;
  insurance?: IdValue | null;
  corporateClient?: IdValue | null;
  createdBy: EmployeeCache | null;
  approvedBy: EmployeeCache | null;
  rejectedBy: EmployeeCache | null;
  sellReturnDetails: SellReturnDetailDTO[];
}

export interface SellReturnDetailDTO
  extends Omit<
    PmsSellReturnDetails,
    | "mrp"
    | "discount"
    | "netDiscount"
    | "tax"
    | "netTax"
    | "totalAmount"
    | "coPayAmount"
    | "customerPayAmount"
    | "netAmount"
  > {
  mrp: number;
  discount: number;
  netDiscount: number;
  tax: number;
  netTax: number;
  totalAmount: number;
  coPayAmount: number;
  customerPayAmount: number;
  netAmount: number;
  sellDetails: {
    returnQuantity: number;
  };
  item: DecimalToNumber<PmsItem> | null;
  insuredCoPay: number | null;
  insuredPatientPay: number | null;
  corporatePaymentValue: number | null;
  corporatePaymentMode: PaymentModePharmacy | null;
  itemCategory: MedCategory | null;
  corporateClientPaymentMode: INCLUDE_EXCLUDE | null;
}

export interface SellReturnExcelFilter {
  id?: number;
  sellRefNo?: string;
  sellReturnRefNo?: string;
  branchId?: number;
  staffId?: number;
  deliveryType?: DeliveryType;
  paymentMode?: PmsPaymentMode;
  isHomeDelivery?: boolean;
  startDate?: Date;
  endDate?: Date;
  customerId?: number;
  billingFor?: BILL_FOR;
  doctorId?: number;
  paymentStatus?: PAYMENT_STATUS;
  status?: RETURN_STS;
}

import {
  IncomeMaster,
  InsuranceMaster,
  InsuranceTypeIns,
  InsurerStatus,
  PaymentModeInsurance,
  PaymentType,
} from "@repo/db/generated/prisma/client";
import { Decimal } from "@repo/db/generated/prisma/internal/prismaNamespace.js";

export interface InsuranceReq {
  id?: number;
  customerCode: string;
  customerName: string;
  contactNo: string;
  email: string;
  contactPersonName: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  customerActiveFrom: Date;
  customerStatus?: string | null;
  status: InsurerStatus;
  logoImage: string | null;
  adhaar?: string | null;
  pan?: string | null;
  gstNo?: string | null;
  ccId?: number | null;
  isMaster: IncomeMaster | null;
  sapCode?: string | null;
  statusChangeRemark?: string | null;
  billAddress?: string | null;
  shiftAddress?: string | null;
  portalAccessConfig?: string | null;
  printConfig?: string | null;
  notificationConfig?: string | null;
  attachments?: string | null;
  paymentMode: PaymentModeInsurance | null;
  insuranceType?: InsuranceTypeIns | null;
  pharmacyPaymentType?: PaymentType | null;
  pharmacyPaymentValue?: Decimal | null;
  opdPaymentValue?: Decimal | null;
  opdPaymentType?: PaymentType | null;
  pathologyPaymentValue?: Decimal | null;
  pathologyPaymentType?: PaymentType | null;
  insuranceBusinessMapping?: InsuranceBusinessMapping[];
}

export interface InsuranceBusinessMapping {
  id?: number;
  insurerId?: number;
  type: string;
  name: string;
  phone: string;
  isDefault: string;
  date: Date;
}

export interface InsuranceImage {
  logoImage?: Express.Multer.File[];
  attachments?: Express.Multer.File[];
}

export type DbInsuranceWithMapping = InsuranceMaster & {
  insuranceBusinessMapping: InsuranceBusinessMapping[];
};

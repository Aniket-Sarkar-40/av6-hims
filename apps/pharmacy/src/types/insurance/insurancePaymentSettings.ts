import { PaymentModePharmacy } from "@repo/db/generated/prisma/enums.js";
import { Decimal } from "@repo/db/generated/prisma/internal/prismaNamespace.js";
import { EmployeeCache } from "../staff/employee.js";

export interface InsurancePaymentSettings {
  id?: number;
  insuranceId: number;
  ccId: number;
  medId: number;
  mrp: Decimal;
  insurancePercentage: Decimal;
  coPay: Decimal;
  patientPay: Decimal;
  paymentMode: PaymentModePharmacy;
  paymentValue: Decimal;
  createdBy: number | null;
}
export interface InsurancePaymentSettingsDTO {
  id?: number;
  insurer?: string;
  cc?: string;
  medicine?: string;
  mrp: Decimal;
  insurancePercentage: Decimal;
  coPay: Decimal;
  patientPay: Decimal;
  paymentMode: PaymentModePharmacy;
  paymentValue: Decimal;
  createdBy: EmployeeCache | null;
}

export interface InsurancePaymentSettingsFilterReq {
  insuranceId?: number;
  ccId?: number;
  medId?: number;
  paymentMode?: PaymentModePharmacy;
}

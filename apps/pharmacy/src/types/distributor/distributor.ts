import { Prisma } from "@repo/db/generated/prisma/client";

export interface CreateDistributorInput extends CommonDistributor {
  distLicNumber?: string | null;
  distLicDocument?: string | null;
  distAgreementDoc?: string | null;
  distGhanaDoc?: string | null;
  distDrugDoc?: string | null;
}

export interface UpdateDistributorInput extends CreateDistributorInput {
  id: number;
}

export interface CreateDistributorReq {
  proInName: string;
  proInEmail: string;
  proCountryCode?: string;
  proInPhone: string;
  dpName: string;
  dpEmail: string;
  dpCountryCode?: string;
  dpPhone: string;
  posEmail?: string;
  posPhoneNotification?: string;
  posWhatsapp?: string;
  posSms?: string;
  grnEmail?: string;
  grnPhoneNotification?: string;
  grnWhatsapp?: string;
  grnSms?: string;
  returnEmail?: string;
  returnPhoneNotification?: string;
  returnWhatsapp?: string;
  returnSms?: string;
  billTo: string;
  shipTo: string;
  bankName: string;
  bankAddress: string;
  bankBranchName: string;
  swiftIfscCode: string;
  bankAccountNumber: string;
  bankAccountType: string;
  termAndCondition?: string;
  stockShipmentDetails?: string;
  taxIdentificationDetails?: string;
  dueDate: string;
}

export interface TaxIdentificationDetails {
  taxIdentificationName: string;
  taxIdentificationValue: string;
}

export interface CommonDistributor {
  proInName: string;
  proInEmail: string;
  proCountryCode?: string;
  proInPhone: string;
  dpName: string;
  dpEmail: string;
  dpCountryCode?: string;
  dpPhone: string;
  posEmail: boolean;
  posPhoneNotification: boolean;
  posWhatsapp: boolean;
  posSms: boolean;
  grnEmail: boolean;
  grnPhoneNotification: boolean;
  grnWhatsapp: boolean;
  grnSms: boolean;
  returnEmail: boolean;
  returnPhoneNotification: boolean;
  returnWhatsapp: boolean;
  returnSms: boolean;
  billTo: string;
  shipTo: string;
  bankName: string;
  bankAddress: string;
  bankBranchName: string;
  swiftIfscCode: string;
  bankAccountNumber: string;
  bankAccountType: string;
  termAndCondition?: string | null;
  stockShipmentDetails?: string | null;
  dueDate: number;
  taxIdentificationDetails?: TaxIdentificationDetails[];
}

export interface DistributorImageFiles {
  distLicNumber?: Express.Multer.File[];
  distLicDocument?: Express.Multer.File[];
  distAgreementDoc?: Express.Multer.File[];
  distGhanaDoc?: Express.Multer.File[];
  distDrugDoc?: Express.Multer.File[];
}

export interface DistributorExcel {
  "Proprietary name": string;
  "Proprietary email": string;
  "Proprietary country code": string | null;
  "Proprietary phone": string;
  "Contact person name": string;
  "Contact person email": string;
  "Contact person country code": string | null;
  "Contact person phone": string;
  "Po email": boolean;
  "Po phone notification": boolean;
  "Po whatsapp": boolean;
  "Po sms": boolean;
  "Grn email": boolean;
  "Grn phone notification": boolean;
  "Grn whatsapp": boolean;
  "Grn sms": boolean;
  "Return email": boolean;
  "Return phone notification": boolean;
  "Return whatsapp": boolean;
  "Return sms": boolean;
  "Bill to": string | null;
  "Ship to": string | null;
  "Dist lic number": string | null;
  "Dist lic document": string | null;
  "Dist agreement doc": string | null;
  "Dist ghana doc": string | null;
  "Dist drug doc": string | null;
  "Bank name": string;
  "Bank address": string;
  "Bank branch name": string;
  "Swift ifsc code": string;
  "Bank account number": string;
  "Bank account type": string;
  "Term and condition": string | null;
  "Stock shipment details": string | null;
  "Due date": number | null;
  "Tax Name": string | null;
  "Tax Value": string | null;
}

export type DistributorResponse = Prisma.DistributorGetPayload<{
  include: {
    taxIdentificationDetails: {
      where: {
        isActive: true;
      };
    };
  };
}>;

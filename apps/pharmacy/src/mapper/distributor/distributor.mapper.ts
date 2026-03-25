import { getDistributorTaxIdentificationsDetails } from "@/repository/distributor/distributor.repository.js";
import {
  CreateDistributorInput,
  CreateDistributorReq,
  DistributorExcel,
  DistributorImageFiles,
  DistributorResponse,
} from "@/types/distributor/distributor.js";
import { Distributor, Prisma } from "@repo/db/generated/prisma/client";
import {
  toPublicImageUrl,
  toRelativeImagePath,
} from "@repo/shared/utils/helper.utils.js";

export const toDistributorEntity = (
  distributor: CreateDistributorReq,
  images: DistributorImageFiles | undefined,
): CreateDistributorInput => {
  return {
    ...distributor,
    dueDate: Number(distributor.dueDate),
    posEmail:
      distributor.posEmail !== undefined && distributor.posEmail === "true"
        ? true
        : false,
    posPhoneNotification:
      distributor.posPhoneNotification !== undefined &&
      distributor.posPhoneNotification === "true"
        ? true
        : false,
    posWhatsapp:
      distributor.posWhatsapp !== undefined &&
      distributor.posWhatsapp === "true"
        ? true
        : false,
    posSms:
      distributor.posSms !== undefined && distributor.posSms === "true"
        ? true
        : false,
    grnEmail:
      distributor.grnEmail !== undefined && distributor.grnEmail === "true"
        ? true
        : false,
    grnPhoneNotification:
      distributor.grnPhoneNotification !== undefined &&
      distributor.grnPhoneNotification === "true"
        ? true
        : false,
    grnWhatsapp:
      distributor.grnWhatsapp !== undefined &&
      distributor.grnWhatsapp === "true"
        ? true
        : false,
    grnSms:
      distributor.grnSms !== undefined && distributor.grnSms === "true"
        ? true
        : false,
    returnEmail:
      distributor.returnEmail !== undefined &&
      distributor.returnEmail === "true"
        ? true
        : false,
    returnPhoneNotification:
      distributor.returnPhoneNotification !== undefined &&
      distributor.returnPhoneNotification === "true"
        ? true
        : false,
    returnWhatsapp:
      distributor.returnWhatsapp !== undefined &&
      distributor.returnWhatsapp === "true"
        ? true
        : false,
    returnSms:
      distributor.returnSms !== undefined && distributor.returnSms === "true"
        ? true
        : false,
    distLicNumber: images?.distLicNumber?.[0].path
      ? toRelativeImagePath(images.distLicNumber?.[0].path)
      : "",
    distLicDocument: images?.distLicDocument?.[0].path
      ? toRelativeImagePath(images.distLicDocument?.[0].path)
      : "",
    distAgreementDoc: images?.distAgreementDoc?.[0].path
      ? toRelativeImagePath(images.distAgreementDoc?.[0].path)
      : "",
    distGhanaDoc: images?.distGhanaDoc?.[0].path
      ? toRelativeImagePath(images.distGhanaDoc?.[0].path)
      : "",
    distDrugDoc: images?.distDrugDoc?.[0].path
      ? toRelativeImagePath(images.distDrugDoc?.[0].path)
      : "",
    taxIdentificationDetails: distributor.taxIdentificationDetails
      ? JSON.parse(distributor.taxIdentificationDetails)
      : null,
  };
};

export const toDistributorDto = (distributor: Distributor): Distributor => {
  return {
    ...distributor,
    distLicNumber: distributor.distLicNumber
      ? toPublicImageUrl(distributor.distLicNumber)
      : "",
    distLicDocument: distributor.distLicDocument
      ? toPublicImageUrl(distributor.distLicDocument)
      : "",
    distAgreementDoc: distributor.distAgreementDoc
      ? toPublicImageUrl(distributor.distAgreementDoc)
      : "",
    distGhanaDoc: distributor.distGhanaDoc
      ? toPublicImageUrl(distributor.distGhanaDoc)
      : "",
    distDrugDoc: distributor.distDrugDoc
      ? toPublicImageUrl(distributor.distDrugDoc)
      : "",
  };
};

export const toDistributorDetailsDto = async (
  distributor: Distributor,
): Promise<DistributorResponse> => {
  const taxIdentificationDetails =
    await getDistributorTaxIdentificationsDetails(distributor.id);

  return {
    ...distributor,
    distLicNumber: distributor.distLicNumber
      ? toPublicImageUrl(distributor.distLicNumber)
      : "",
    distLicDocument: distributor.distLicDocument
      ? toPublicImageUrl(distributor.distLicDocument)
      : "",
    distAgreementDoc: distributor.distAgreementDoc
      ? toPublicImageUrl(distributor.distAgreementDoc)
      : "",
    distGhanaDoc: distributor.distGhanaDoc
      ? toPublicImageUrl(distributor.distGhanaDoc)
      : "",
    distDrugDoc: distributor.distDrugDoc
      ? toPublicImageUrl(distributor.distDrugDoc)
      : "",
    taxIdentificationDetails,
  };
};

export function toDistributorExcel(
  dist: DistributorResponse | null,
): DistributorExcel {
  const taxName =
    dist?.taxIdentificationDetails
      ?.map((tid) => tid.taxIdentificationName)
      .join(", ") || "Sample Tax Name";
  const taxValue =
    dist?.taxIdentificationDetails
      ?.map((tid) => tid.taxIdentificationValue)
      .join(", ") || "Sample Tax Value";
  return {
    "Proprietary name": dist?.proInName || "Sample Name",
    "Proprietary email": dist?.proInEmail || "Sample@mail.com",
    "Proprietary country code": dist?.proCountryCode || "+233",
    "Proprietary phone": dist?.proInPhone || "123456789",
    "Contact person name": dist?.dpName || "Sample Contact Name",
    "Contact person email": dist?.dpEmail || "Sampleperson@mail.com",
    "Contact person country code": dist?.dpCountryCode || "+233",
    "Contact person phone": dist?.dpPhone || "123456789",
    "Po email": dist?.posEmail || false,
    "Po phone notification": dist?.posPhoneNotification || false,
    "Po whatsapp": dist?.posWhatsapp || false,
    "Po sms": dist?.posSms || false,
    "Grn email": dist?.grnEmail || false,
    "Grn phone notification": dist?.grnPhoneNotification || false,
    "Grn whatsapp": dist?.grnWhatsapp || false,
    "Grn sms": dist?.grnSms || false,
    "Return email": dist?.returnEmail || false,
    "Return phone notification": dist?.returnPhoneNotification || false,
    "Return whatsapp": dist?.returnWhatsapp || false,
    "Return sms": dist?.returnSms || false,
    "Bill to": dist?.billTo || "Sample Address",
    "Ship to": dist?.shipTo || "Sample Address",
    "Dist lic number": dist?.distLicNumber || "123456789",
    "Dist lic document": dist?.distLicDocument || "Sample Doc",
    "Dist agreement doc": dist?.distAgreementDoc || "Sample Agreement Doc",
    "Dist ghana doc": dist?.distGhanaDoc || "Sample Ghana Doc",
    "Dist drug doc": dist?.distDrugDoc || "Sample Drug Doc",
    "Bank name": dist?.bankName || "State Bank Of India",
    "Bank address": dist?.bankAddress || "Sample Bank Address",
    "Bank branch name": dist?.bankBranchName || "Sample Branch",
    "Swift ifsc code": dist?.swiftIfscCode || "SBIN2002",
    "Bank account number": dist?.bankAccountNumber || "123456547896",
    "Bank account type": dist?.bankAccountType || "Savings",
    "Term and condition": dist?.termAndCondition || "Sample Term & Condition",
    "Stock shipment details":
      dist?.stockShipmentDetails || "Sample Shipment Details",
    "Due date": dist?.dueDate || 15,
    "Tax Name": taxName || "Sample Tax Name",
    "Tax Value": taxValue ? String(taxValue) : "Sample Tax Value",
  };
}

export function fromDistributorExcel(
  row: DistributorExcel,
): Prisma.DistributorUncheckedCreateInput {
  return {
    proInName: row["Proprietary name"],
    proInEmail: row["Proprietary email"],
    proInPhone:
      typeof row["Proprietary phone"] !== "string"
        ? JSON.stringify(row["Proprietary phone"])
        : row["Proprietary phone"],
    dpName: row["Contact person name"],
    dpEmail: row["Contact person email"],
    dpPhone:
      typeof row["Contact person phone"] !== "string"
        ? JSON.stringify(row["Contact person phone"])
        : row["Contact person phone"],
    posEmail:
      typeof row["Po email"] !== "boolean"
        ? JSON.stringify(row["Po email"])?.toLowerCase() === "true"
        : row["Po email"],
    posPhoneNotification:
      typeof row["Po phone notification"] !== "boolean"
        ? JSON.stringify(row["Po phone notification"])?.toLowerCase() === "true"
        : row["Po phone notification"],
    posWhatsapp:
      typeof row["Po whatsapp"] !== "boolean"
        ? JSON.stringify(row["Po whatsapp"])?.toLowerCase() === "true"
        : row["Po whatsapp"],
    posSms:
      typeof row["Po sms"] !== "boolean"
        ? JSON.stringify(row["Po sms"])?.toLowerCase() === "true"
        : row["Po sms"],
    grnEmail:
      typeof row["Grn email"] !== "boolean"
        ? JSON.stringify(row["Grn email"])?.toLowerCase() === "true"
        : row["Grn email"],
    grnPhoneNotification:
      typeof row["Grn phone notification"] !== "boolean"
        ? JSON.stringify(row["Grn phone notification"])?.toLowerCase() ===
          "true"
        : row["Grn phone notification"],
    grnWhatsapp:
      typeof row["Grn whatsapp"] !== "boolean"
        ? JSON.stringify(row["Grn whatsapp"])?.toLowerCase() === "true"
        : row["Grn whatsapp"],
    grnSms:
      typeof row["Grn sms"] !== "boolean"
        ? JSON.stringify(row["Grn sms"])?.toLowerCase() === "true"
        : row["Grn sms"],
    returnEmail:
      typeof row["Return email"] !== "boolean"
        ? JSON.stringify(row["Return email"])?.toLowerCase() === "true"
        : row["Return email"],
    returnPhoneNotification:
      typeof row["Return phone notification"] !== "boolean"
        ? JSON.stringify(row["Return phone notification"])?.toLowerCase() ===
          "true"
        : row["Return phone notification"],
    returnWhatsapp:
      typeof row["Return whatsapp"] !== "boolean"
        ? JSON.stringify(row["Return whatsapp"])?.toLowerCase() === "true"
        : row["Return whatsapp"],
    returnSms:
      typeof row["Return sms"] !== "boolean"
        ? JSON.stringify(row["Return sms"])?.toLowerCase() === "true"
        : row["Return sms"],
    billTo: row["Bill to"] || "",
    shipTo: row["Ship to"] || "",
    distLicNumber:
      typeof row["Dist lic number"] !== "string"
        ? JSON.stringify(row["Dist lic number"])
        : row["Dist lic number"],
    distLicDocument: row["Dist lic document"],
    distAgreementDoc: row["Dist agreement doc"],
    distGhanaDoc: row["Dist ghana doc"],
    distDrugDoc: row["Dist drug doc"],
    bankName: row["Bank name"],
    bankAddress: row["Bank address"],
    bankBranchName: row["Bank branch name"],
    swiftIfscCode: row["Swift ifsc code"],
    bankAccountNumber: row["Bank account number"],
    bankAccountType: row["Bank account type"],
    termAndCondition: row["Term and condition"],
    stockShipmentDetails: row["Stock shipment details"],
    dueDate: row["Due date"] || 0,
    taxIdentificationDetails: {
      create:
        row["Tax Name"] && row["Tax Value"]
          ? {
              taxIdentificationName: String(row["Tax Name"]),
              taxIdentificationValue: String(row["Tax Value"]),
            }
          : undefined,
    },
  };
}

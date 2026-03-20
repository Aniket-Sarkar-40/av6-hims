import { generalBillItemService } from "@/services/master/generalBillItem.service.js";
import {
  GeneralBillingDetailDto,
  GeneralBillingDto,
  GeneralBillingResponse,
} from "@/types/appointment/generalBilling.js";
import { customOmit, toIdValue } from "av6-utils";

export const toGeneralBillingDto = async (
  master: GeneralBillingResponse,
): Promise<GeneralBillingDto> => {
  const masterData = customOmit<
    GeneralBillingResponse,
    | "ccId"
    | "patientId"
    | "isActive"
    | "createdBy"
    | "updatedBy"
    | "deletedBy"
    | "createdAt"
    | "updatedAt"
    | "deletedAt"
    | "generalBillingDetails"
    | "collectionCenter"
    | "patient"
  >(master, [
    "ccId",
    "patientId",
    "isActive",
    "createdBy",
    "updatedBy",
    "deletedBy",
    "createdAt",
    "updatedAt",
    "deletedAt",
    "generalBillingDetails",
    "collectionCenter",
    "patient",
  ]);

  const details: GeneralBillingDetailDto[] = [];
  for (const detailData of master.generalBillingDetails) {
    const detailInfo = customOmit(detailData, [
      "generalBillingId",
      "generalBillItemId",
      "isActive",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]);

    const generalBillItem =
      await generalBillItemService.getGeneralBillItemByIdWoDto(
        detailData.generalBillItemId,
        true,
      );

    details.push({
      ...detailInfo.rest,
      generalBillItem: generalBillItem
        ? toIdValue(generalBillItem, "name")
        : null,
    });
  }

  return {
    ...masterData.rest,
    details,
    collectionCenter: master.collectionCenter
      ? toIdValue(master.collectionCenter, "colName")
      : null,
    patient: master.patient ? toIdValue(master.patient, "patientName") : null,
  };
};

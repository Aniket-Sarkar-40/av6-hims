import { pharmacyRequests } from "@/client/pharmacy/request.js";
import { medicineTabService } from "@/services/appointment/medicineTab.service.js";
import { MedicineTabDetailsDto } from "@/types/appointment/medicineTabDetails.js";
import { GetItemReq } from "@/types/item.js";
import { customOmit, toIdValue } from "av6-utils";
import { MedicineTabDetails } from "@repo/db/generated/prisma/client";

export const toMedicineTabDetailsDto = async (
  rows: MedicineTabDetails[],
  ccId: number,
): Promise<MedicineTabDetailsDto[]> => {
  const results: MedicineTabDetailsDto[] = [];

  for (const row of rows) {
    const omitted = customOmit<
      MedicineTabDetails,
      | "medicineTabId"
      | "medId"
      | "createdBy"
      | "updatedBy"
      | "deletedBy"
      | "isActive"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
    >(row, [
      "medicineTabId",
      "medId",
      "createdBy",
      "updatedBy",
      "deletedBy",
      "isActive",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ]);

    const payload: GetItemReq = {
      id: row.medId,
      branchId: ccId,
      insuranceId: undefined,
      corporateClientId: undefined,
      isZeroQty: false,
      isCustomPricing: true,
      isItemBranchMap: true,
    };

    const medTab = await medicineTabService.getMedicineTabById(
      row.medicineTabId,
    );
    const itemData = await pharmacyRequests.getItemById(payload);
    results.push({
      ...omitted.rest,
      medicineTab: toIdValue(medTab, "medTabName"),
      med: itemData,
    });
  }

  return results;
};

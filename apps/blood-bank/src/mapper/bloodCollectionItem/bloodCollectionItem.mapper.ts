import { getAll } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { BloodCollectionItemDTO } from "@/types/bloodCollectionItem/bloodCollectionItem.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BloodCollectionItem } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodCollectionItemDTO = async (
  data: BloodCollectionItem[],
): Promise<BloodCollectionItemDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  const allBloodCollections = await getAll({
    model: "BloodCollection",
    useActiveFlag: true,
  });

  const allEmployees = await employeeService.getAllEmployees();

  return data.map((bloodCollectionItem) => {
    const omittedBloodCollectionItem = customOmit<
      BloodCollectionItem,
      BaseModelAttrWoCancel | "bloodBankCenterId" | "collectionId"
    >(bloodCollectionItem, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
      "collectionId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodCollectionItem.bloodBankCenterId,
    );

    const collection = allBloodCollections.find(
      (c) => c.id === bloodCollectionItem.collectionId,
    );

    const stockPostedByStaff = allEmployees.find(
      (e) => e.id === bloodCollectionItem.stockPostedByStaffId,
    );

    return {
      ...omittedBloodCollectionItem.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
      collection: toIdValue(collection, "collectionNo") ?? null,
      stockPostedByStaff: toIdValue(stockPostedByStaff, "name") ?? null,
    };
  });
};

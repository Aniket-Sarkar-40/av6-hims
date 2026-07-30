import { getAll } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { BloodCollectionDTO } from "@/types/bloodCollection/bloodCollection.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BloodCollection } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodCollectionDTO = async (
  data: BloodCollection[],
): Promise<BloodCollectionDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  const allBloodDonors = await getAll({
    model: "BloodDonor",
    useActiveFlag: true,
  });

  const allStaffs = await employeeService.getAllEmployees();

  const allExternalCenters =
    await commonService.getAllElements<"BloodExternalCenter">({
      cacheCode: "BLOOD_EXTERNAL_CENTER",
      canNullReturnable: true,
      modelName: "BloodExternalCenter",
      shortCode: "BLOOD_EXTERNAL_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodCollection) => {
    const omittedBloodCollection = customOmit<
      BloodCollection,
      | BaseModelAttrWoCancel
      | "bloodBankCenterId"
      | "donorId"
      | "receivedByStaffId"
      | "externalCenterId"
    >(bloodCollection, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
      "donorId",
      "receivedByStaffId",
      "externalCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodCollection.bloodBankCenterId,
    );
    const donor = allBloodDonors.find((d) => d.id === bloodCollection.donorId);
    const receivedByStaff = allStaffs.find(
      (s) => s.id === bloodCollection.receivedByStaffId,
    );
    const externalCenter = allExternalCenters.find(
      (e) => e.id === bloodCollection.externalCenterId,
    );
    return {
      ...omittedBloodCollection.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
      donor: toIdValue(donor, "donorName") ?? null,
      receivedByStaff: toIdValue(receivedByStaff, "name") ?? null,
      externalCenter: toIdValue(externalCenter, "centerName") ?? null,
    };
  });
};

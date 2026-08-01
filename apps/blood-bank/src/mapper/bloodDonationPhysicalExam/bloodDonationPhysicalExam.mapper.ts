import { getAll } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { BloodDonationPhysicalExamDTO } from "@/types/bloodDonationPhysicalExam/bloodDonationPhysicalExam.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BloodDonationPhysicalExam } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodDonationPhysicalExamDTO = async (
  data: BloodDonationPhysicalExam[],
): Promise<BloodDonationPhysicalExamDTO[]> => {
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

  const allDonors = await getAll({
    model: "BloodDonor",
    useActiveFlag: true,
  });

  const allEmployees = await employeeService.getAllEmployees();

  return data.map((bloodDonationPhysicalExam) => {
    const omittedBloodDonationPhysicalExam = customOmit<
      BloodDonationPhysicalExam,
      | BaseModelAttrWoCancel
      | "bloodBankCenterId"
      | "collectionId"
      | "donorId"
      | "examinedByStaffId"
    >(bloodDonationPhysicalExam, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
      "collectionId",
      "donorId",
      "examinedByStaffId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodDonationPhysicalExam.bloodBankCenterId,
    );

    const collection = allBloodCollections.find(
      (c) => c.id === bloodDonationPhysicalExam.collectionId,
    );

    const donor = allDonors.find(
      (d) => d.id === bloodDonationPhysicalExam.donorId,
    );

    const examinedByStaff = allEmployees.find(
      (e) => e.id === bloodDonationPhysicalExam.examinedByStaffId,
    );

    return {
      ...omittedBloodDonationPhysicalExam.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
      collection: toIdValue(collection, "collectionNo") ?? null,
      examinedByStaff: toIdValue(examinedByStaff, "name") ?? null,
      donor: toIdValue(donor, "donorName") ?? null,
    };
  });
};

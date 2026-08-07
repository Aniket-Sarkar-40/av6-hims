import { getAll } from "@/repository/common.repository.js";
import {
  BloodCollectionDTO,
  BloodCollectionResponse,
} from "@/types/bloodCollection/bloodCollection.js";
import { BloodCollectionItemDTO } from "@/types/bloodCollectionItem/bloodCollectionItem.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import { BloodCollection } from "@repo/db/generated/prisma/client";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodCollectionDTO = async (
  data: BloodCollectionResponse[],
): Promise<BloodCollectionDTO[]> => {
  const allPhysicalExams = await getAll({
    model: "BloodDonationPhysicalExam",
    useActiveFlag: true,
  });

  const allBloodBankCenters = await getAll({
    model: "BloodBankCenter",
    useActiveFlag: true,
  });

  const allDonors = await getAll({
    model: "BloodDonor",
    useActiveFlag: true,
  });

  const allExternalCenters = await getAll({
    model: "BloodExternalCenter",
    useActiveFlag: true,
  });

  const allStaff = await employeeService.getAllEmployees();

  return data.map((bloodCollection) => {
    const omittedBloodCollection = customOmit<
      BloodCollection,
      | "createdBy"
      | "updatedBy"
      | "deletedBy"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "isActive"
      | "bloodBankCenterId"
      | "donorId"
      | "externalCenterId"
      | "receivedByStaffId"
    >(bloodCollection, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "isActive",
      "bloodBankCenterId",
      "donorId",
      "externalCenterId",
      "receivedByStaffId",
    ]);

    const matchedBloodBankCenter = allBloodBankCenters.find(
      (center) => center.id === bloodCollection.bloodBankCenterId,
    );

    const matchedDonor = allDonors.find(
      (donor) => donor.id === bloodCollection.donorId,
    );

    const matchedStaff = allStaff.find(
      (staff) => staff.id === bloodCollection.receivedByStaffId,
    );

    const matchedExternalCenter = allExternalCenters.find(
      (center) => center.id === bloodCollection.externalCenterId,
    );

    const matchedPhysicalExam = allPhysicalExams.find(
      (exam) => exam.id === bloodCollection.physicalExamId,
    );

    const collectionItems: BloodCollectionItemDTO[] = bloodCollection.items.map(
      (result) => {
        const omittedResult = customOmit(result, [
          "createdBy",
          "updatedBy",
          "deletedBy",
          "createdAt",
          "updatedAt",
          "deletedAt",
          "isActive",
          "bloodBankCenterId",
          "collectionId",
          "stockPostedByStaffId",
        ]);

        return omittedResult.rest;
      },
    );

    return {
      ...omittedBloodCollection.rest,
      bloodBankCenter: toIdValue(matchedBloodBankCenter, "centerName") ?? null,
      donor: toIdValue(matchedDonor, "donorName") ?? null,
      externalCenter: toIdValue(matchedExternalCenter, "centerName") ?? null,
      receivedByStaff: toIdValue(matchedStaff, "name") ?? null,
      physicalExam: toIdValue(matchedPhysicalExam, "examNo") ?? null,
      items: collectionItems,
    };
  });
};

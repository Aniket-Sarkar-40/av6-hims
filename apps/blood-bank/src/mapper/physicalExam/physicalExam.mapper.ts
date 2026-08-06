import { getAll } from "@/repository/common.repository.js";
import {
  BloodDonationPhysicalExamDTO,
  BloodDonationPhysicalExamResponse,
} from "@/types/physicalExam/physicalExam.js";
import { BloodDonationPhysicalExamAnswerDTO } from "@/types/physicalExamAnswer/physicalExamAnswer.js";
import { employeeService } from "@apps/core/services/staff/employee.service.js";
import {
  BloodDonationPhysicalExam,
  BloodDonationPhysicalExamAnswer,
} from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodDonationPhysicalExamDTO = async (
  data: BloodDonationPhysicalExamResponse[],
): Promise<BloodDonationPhysicalExamDTO[]> => {
  const allQuestions = await getAll({
    model: "BloodPhysicalExamQuestion",
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

  const allStaff = await employeeService.getAllEmployees();

  return data.map((bloodDonationPhysicalExam) => {
    const omittedPhysicalExam = customOmit<
      BloodDonationPhysicalExam,
      | "createdBy"
      | "updatedBy"
      | "deletedBy"
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "isActive"
      | "bloodBankCenterId"
      | "donorId"
      | "examinedByStaffId"
    >(bloodDonationPhysicalExam, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "isActive",
      "bloodBankCenterId",
      "donorId",
      "examinedByStaffId",
    ]);

    const matchedBloodBankCenter = allBloodBankCenters.find(
      (center) => center.id === bloodDonationPhysicalExam.bloodBankCenterId,
    );

    const matchedDonor = allDonors.find(
      (donor) => donor.id === bloodDonationPhysicalExam.donorId,
    );

    const matchedStaff = allStaff.find(
      (staff) => staff.id === bloodDonationPhysicalExam.examinedByStaffId,
    );

    const examAnswers: BloodDonationPhysicalExamAnswerDTO[] =
      bloodDonationPhysicalExam.answers.map((result) => {
        const omittedResult = customOmit<
          BloodDonationPhysicalExamAnswer,
          BaseModelAttrWoCancel | "physicalExamId" | "questionId"
        >(result, [
          "createdBy",
          "updatedBy",
          "deletedBy",
          "createdAt",
          "updatedAt",
          "deletedAt",
          "isActive",
          "physicalExamId",
          "questionId",
        ]);

        const question = allQuestions.find((q) => q.id === result.questionId);

        return {
          ...omittedResult.rest,
          question: toIdValue(question, "question") ?? null,
        };
      });

    return {
      ...omittedPhysicalExam.rest,
      bloodBankCenter: toIdValue(matchedBloodBankCenter, "centerName") ?? null,
      donor: toIdValue(matchedDonor, "donorName") ?? null,
      examinedByStaff: toIdValue(matchedStaff, "name") ?? null,
      answers: examAnswers,
    };
  });
};

import { commonService } from "@/services/common.service.js";
import { BloodPhysicalExamQuestionDTO } from "@/types/master/bloodPhysicalExamQuestion.js";
import { BloodPhysicalExamQuestion } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodPhysicalExamQuestionDTO = async (
  data: BloodPhysicalExamQuestion[],
): Promise<BloodPhysicalExamQuestionDTO[]> => {
  const allBloodBankCenters =
    await commonService.getAllElements<"BloodBankCenter">({
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    });

  return data.map((bloodPhysicalExamQuestion) => {
    const omittedBloodPhysicalExamQuestion = customOmit<
      BloodPhysicalExamQuestion,
      BaseModelAttrWoCancel | "bloodBankCenterId"
    >(bloodPhysicalExamQuestion, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "bloodBankCenterId",
    ]);

    const bloodBankCenter = allBloodBankCenters.find(
      (b) => b.id === bloodPhysicalExamQuestion.bloodBankCenterId,
    );
    return {
      ...omittedBloodPhysicalExamQuestion.rest,
      bloodBankCenter: toIdValue(bloodBankCenter, "centerName") ?? null,
    };
  });
};

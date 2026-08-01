import { getAll } from "@/repository/common.repository.js";
import { BloodDonationPhysicalExamAnswerDTO } from "@/types/bloodDonationPhysicalExamAnswer/bloodDonationPhysicalExamAnswer.js";
import { BloodDonationPhysicalExamAnswer } from "@repo/db/generated/prisma/client";
import { BaseModelAttrWoCancel } from "@repo/shared/types/global.js";
import { customOmit, toIdValue } from "av6-utils";

export const toBloodDonationPhysicalExamAnswerDTO = async (
  data: BloodDonationPhysicalExamAnswer[],
): Promise<BloodDonationPhysicalExamAnswerDTO[]> => {
  const allPhysicalExams = await getAll({
    model: "BloodDonationPhysicalExam",
    useActiveFlag: true,
  });

  const allQuestions = await getAll({
    model: "BloodPhysicalExamQuestion",
    useActiveFlag: true,
  });

  return data.map((bloodDonationPhysicalExamAnswer) => {
    const omittedBloodDonationPhysicalExamAnswer = customOmit<
      BloodDonationPhysicalExamAnswer,
      BaseModelAttrWoCancel | "physicalExamId" | "questionId"
    >(bloodDonationPhysicalExamAnswer, [
      "createdBy",
      "updatedBy",
      "deletedBy",
      "createdAt",
      "updatedAt",
      "deletedAt",
      "physicalExamId",
      "questionId",
    ]);

    const physicalExam = allPhysicalExams.find(
      (p) => p.id === bloodDonationPhysicalExamAnswer.physicalExamId,
    );

    const question = allQuestions.find(
      (q) => q.id === bloodDonationPhysicalExamAnswer.questionId,
    );

    return {
      ...omittedBloodDonationPhysicalExamAnswer.rest,
      physicalExam: toIdValue(physicalExam, "collectionId") ?? null,
      question: toIdValue(question, "question") ?? null,
    };
  });
};

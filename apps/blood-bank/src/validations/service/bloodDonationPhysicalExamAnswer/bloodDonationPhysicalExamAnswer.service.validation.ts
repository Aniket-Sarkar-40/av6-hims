import { getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodDonationPhysicalExamAnswer } from "@/types/bloodDonationPhysicalExamAnswer/bloodDonationPhysicalExamAnswer.js";
import { validateIdBloodDonationPhysicalExam } from "@/validations/service/bloodDonationPhysicalExam/bloodDonationPhysicalExam.service.validation.js";
import { validateIdBloodPhysicalExamQuestion } from "@/validations/service/master/bloodPhysicalExamQuestion.service.validation.js";
import { BloodDonationPhysicalExamAnswer } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodDonationPhysicalExamAnswer = async (
  id: number,
): Promise<BloodDonationPhysicalExamAnswer> => {
  logger.info(
    "entering::validateIdBloodDonationPhysicalExamAnswer::service::validation",
  );

  validIdCheck(id);

  const bloodDonationPhysicalExamAnswer = await getByUnique({
    model: "BloodDonationPhysicalExamAnswer",
    where: {
      id,
    },
  });
  if (!bloodDonationPhysicalExamAnswer) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Donation Physical Exam Answer"),
    );
  }
  logger.info(
    "exiting::validateIdBloodDonationPhysicalExamAnswer::service::validation",
  );

  return bloodDonationPhysicalExamAnswer;
};

export const createOrUpdateBloodDonationPhysicalExamAnswerServiceValidation =
  async (body: CreateOrUpdateBloodDonationPhysicalExamAnswer) => {
    logger.info(
      "entering::createOrUpdateBloodDonationPhysicalExamAnswerServiceValidation::service::validation",
    );
    if (body.id) {
      await validateIdBloodDonationPhysicalExamAnswer(body.id);
    }

    await validateIdBloodDonationPhysicalExam(body.physicalExamId);
    await validateIdBloodPhysicalExamQuestion(body.questionId);

    const duplicatePhysicalExamAnswer = await getByUnique({
      model: "BloodDonationPhysicalExamAnswer",
      where: {
        physicalExamId: body.physicalExamId,
        questionId: body.questionId,
        answerValue: body.answerValue,
        NOT: body.id ? { id: body.id } : undefined,
      },
    });

    if (duplicatePhysicalExamAnswer) {
      throw new ErrorHandler(
        400,
        generateErrorMessage(
          "DUPLICATE_ITEM",
          "Physical Exam Answer for this Question and Exam",
        ),
      );
    }

    logger.info(
      "exiting::createOrUpdateBloodDonationPhysicalExamAnswerServiceValidation::service::validation",
    );
  };

import { getByUnique } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { CreateOrUpdateBloodPhysicalExamQuestion } from "@/types/master/bloodPhysicalExamQuestion.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { BloodPhysicalExamQuestion } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodPhysicalExamQuestion = async (
  id: number,
): Promise<BloodPhysicalExamQuestion> => {
  logger.info(
    "entering::validateIdBloodPhysicalExamQuestion::service::validation",
  );

  validIdCheck(id);

  const bloodPhysicalExamQuestion =
    await commonService.getElementById<"BloodPhysicalExamQuestion">({
      cacheCode: "BLOOD_PHYSICAL_EXAM_QUESTION",
      canNullReturnable: true,
      id,
      modelName: "BloodPhysicalExamQuestion",
      shortCode: "BLOOD_PHYSICAL_EXAM_QUESTION",
      useActiveFlag: true,
    });
  if (!bloodPhysicalExamQuestion) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Physical Exam Question"),
    );
  }
  logger.info(
    "exiting::validateIdBloodPhysicalExamQuestion::service::validation",
  );

  return bloodPhysicalExamQuestion;
};

export const createOrUpdateBloodPhysicalExamQuestionServiceValidation = async (
  body: CreateOrUpdateBloodPhysicalExamQuestion,
) => {
  logger.info(
    "entering::createOrUpdateBloodPhysicalExamQuestionServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodPhysicalExamQuestion(body.id);
  }

  await validateIdBloodBankCenter(body.bloodBankCenterId);

  const bloodPhysicalExamQuestion = await getByUnique({
    model: "BloodPhysicalExamQuestion",
    where: {
      question: body.question,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (bloodPhysicalExamQuestion) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Blood Physical Exam Question"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodPhysicalExamQuestionServiceValidation::service::validation",
  );
};

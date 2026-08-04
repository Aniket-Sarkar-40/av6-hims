import { getAll, getByUnique } from "@/repository/common.repository.js";
import { CreateOrUpdateBloodDonationPhysicalExam } from "@/types/bloodDonationPhysicalExam/bloodDonationPhysicalExam.js";
import { validateIdBloodDonor } from "@/validations/service/bloodDonor/bloodDonor.service.validation.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { validateIdBloodPhysicalExamQuestion } from "@/validations/service/master/bloodPhysicalExamQuestion.service.validation.js";
import { BloodDonationPhysicalExam } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdPhysicalExam = async (
  id: number,
): Promise<BloodDonationPhysicalExam> => {
  logger.info("entering::validateIdPhysicalExam::service::validation");
  validIdCheck(id);

  const physicalExam = await getByUnique({
    model: "BloodDonationPhysicalExam",
    where: {
      id,
      isActive: true,
    },
  });
  if (!physicalExam) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Physical Exam"),
    );
  }
  logger.info("exiting::validateIdPhysicalExam::service::validation");

  return physicalExam;
};

export const upsertPhysicalExamServiceValidation = async (
  body: CreateOrUpdateBloodDonationPhysicalExam,
): Promise<void> => {
  logger.info(
    "entering::upsertPhysicalExamServiceValidation::service::validation",
  );

  if (body.id) {
    await validateIdPhysicalExam(body.id);
  }

  await validateIdBloodDonor(body.donorId);

  await validateIdBloodBankCenter(body.bloodBankCenterId);

  const questionIds = body.examResponse.map((item) => item.questionId);
  const uniqueQuestionIds = [...new Set(questionIds)];

  if (body.examResponse) {
    for (const response of body.examResponse) {
      await validateIdBloodPhysicalExamQuestion(response.questionId);
    }
  }

  const questions = await getAll<"BloodPhysicalExamQuestion">({
    model: "BloodPhysicalExamQuestion",
    useActiveFlag: true,
    where: {
      id: {
        in: uniqueQuestionIds,
      },
      bloodBankCenterId: body.bloodBankCenterId,
    },
  });

  if (questions.length !== uniqueQuestionIds.length) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "INVALID_ASSOCIATION",
        "Physical Exam Question",
        "Blood Bank Center",
      ),
    );
  }

  const existingPhysicalExam = await getByUnique<"BloodDonationPhysicalExam">({
    model: "BloodDonationPhysicalExam",
    useActiveFlag: false,
    where: {
      bloodBankCenterId: body.bloodBankCenterId,
      donorId: body.donorId,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (existingPhysicalExam) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Physical Exam for this Donor and Blood Bank Center",
      ),
    );
  }

  logger.info(
    "exiting::upsertPhysicalExamServiceValidation::service::validation",
  );
};

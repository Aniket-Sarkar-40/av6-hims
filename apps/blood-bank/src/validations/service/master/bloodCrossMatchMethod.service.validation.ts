import { getByUnique } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { CreateOrUpdateBloodCrossMatchMethod } from "@/types/master/bloodCrossMatchMethod.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { BloodCrossMatchMethod } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodCrossMatchMethod = async (
  id: number
): Promise<BloodCrossMatchMethod> => {
  logger.info("entering::validateIdBloodCrossMatchMethod::service::validation");

  validIdCheck(id);

  const row = await commonService.getElementById<"BloodCrossMatchMethod">({
    cacheCode: "BLOOD_CROSS_MATCH_METHOD",
    canNullReturnable: true,
    id,
    modelName: "BloodCrossMatchMethod",
    shortCode: "BLOOD_CROSS_MATCH_METHOD",
    useActiveFlag: true,
  });
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Cross Match Method")
    );
  }
  logger.info("exiting::validateIdBloodCrossMatchMethod::service::validation");

  return row;
};

export const createOrUpdateBloodCrossMatchMethodServiceValidation = async (
  body: CreateOrUpdateBloodCrossMatchMethod
) => {
  logger.info(
    "entering::createOrUpdateBloodCrossMatchMethodServiceValidation::service::validation"
  );
  if (body.id) {
    await validateIdBloodCrossMatchMethod(body.id);
  }

  await validateIdBloodBankCenter(body.bloodBankCenterId);

  const bloodCrossMatchMethod = await getByUnique({
    model: "BloodCrossMatchMethod",
    where: {
      methodName: body.methodName,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (bloodCrossMatchMethod) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Blood Cross Match Method")
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodCrossMatchMethodServiceValidation::service::validation"
  );
};

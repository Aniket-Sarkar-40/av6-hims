import { getByUnique } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { CreateOrUpdateBloodExternalCenter } from "@/types/master/bloodExternalCenter.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import { BloodExternalCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodExternalCenter = async (
  id: number,
): Promise<BloodExternalCenter> => {
  logger.info("entering::validateIdBloodExternalCenter::service::validation");

  validIdCheck(id);

  const row = await commonService.getElementById<"BloodExternalCenter">({
    cacheCode: "BLOOD_EXTERNAL_CENTER",
    canNullReturnable: true,
    id,
    modelName: "BloodExternalCenter",
    shortCode: "BLOOD_EXTERNAL_CENTER",
    useActiveFlag: true,
  });
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood External Center"),
    );
  }
  logger.info("exiting::validateIdBloodExternalCenter::service::validation");

  return row;
};

export const createOrUpdateBloodExternalCenterServiceValidation = async (
  body: CreateOrUpdateBloodExternalCenter,
) => {
  logger.info(
    "entering::createOrUpdateBloodExternalCenterServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodExternalCenter(body.id);
  }

  await validateIdBloodBankCenter(body.bloodBankCenterId);

  const bloodExternalCenter = await getByUnique({
    model: "BloodExternalCenter",
    where: {
      centerName: body.centerName,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (bloodExternalCenter) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Blood External Center"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodExternalCenterServiceValidation::service::validation",
  );
};

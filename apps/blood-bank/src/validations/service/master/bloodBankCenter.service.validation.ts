import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { CreateOrUpdateBloodBankCenter } from "@/types/master/bloodBankCenter.js";
import { validateHospitalId } from "@/validations/service/master/hospital.service.validation.js";
import {
  BloodBankCenter,
  BloodBankUinShortCode,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodBankCenter = async (
  id: number,
): Promise<BloodBankCenter> => {
  logger.info("entering::validateIdBloodBankCenter::service::validation");

  validIdCheck(id);

  const bloodBankCenter = await commonService.getElementById<"BloodBankCenter">(
    {
      cacheCode: "BLOOD_BANK_CENTER",
      canNullReturnable: true,
      id,
      modelName: "BloodBankCenter",
      shortCode: "BLOOD_BANK_CENTER",
      useActiveFlag: true,
    },
  );
  if (!bloodBankCenter) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Bank Center"),
    );
  }
  logger.info("exiting::validateIdBloodBankCenter::service::validation");

  return bloodBankCenter;
};

export const createOrUpdateBloodBankCenterServiceValidation = async (
  body: CreateOrUpdateBloodBankCenter,
) => {
  logger.info(
    "entering::createOrUpdateBloodBankCenterServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodBankCenter(body.id);
  }

  if (!body.centerCode) {
    body.centerCode = await uinServiceFactory.generateUIN(
      BloodBankUinShortCode.BBC,
    );
  }

  await validateHospitalId(body.hospitalId);

  const bloodBankCenter = await getByUnique({
    model: "BloodBankCenter",
    where: {
      centerName: body.centerName,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (bloodBankCenter) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Blood Bank Center"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodBankCenterServiceValidation::service::validation",
  );
};

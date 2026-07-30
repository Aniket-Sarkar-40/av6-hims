import { uinServiceFactory } from "@/config/core.config.js";
import { getByUnique } from "@/repository/common.repository.js";
import { commonService } from "@/services/common.service.js";
import { CreateOrUpdateBloodComponent } from "@/types/master/bloodComponent.js";
import { validateIdBloodBankCenter } from "@/validations/service/master/bloodBankCenter.service.validation.js";
import {
  BloodBankUinShortCode,
  BloodComponent,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";

export const validateIdBloodComponent = async (
  id: number,
): Promise<BloodComponent> => {
  logger.info("entering::validateIdBloodComponent::service::validation");

  validIdCheck(id);

  const row = await commonService.getElementById<"BloodComponent">({
    cacheCode: "BLOOD_COMPONENT",
    canNullReturnable: true,
    id,
    modelName: "BloodComponent",
    shortCode: "BLOOD_COMPONENT",
    useActiveFlag: true,
  });
  if (!row) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Blood Component"),
    );
  }
  logger.info("exiting::validateIdBloodComponent::service::validation");

  return row;
};

export const createOrUpdateBloodComponentServiceValidation = async (
  body: CreateOrUpdateBloodComponent,
) => {
  logger.info(
    "entering::createOrUpdateBloodComponentServiceValidation::service::validation",
  );
  if (body.id) {
    await validateIdBloodComponent(body.id);
  }

  await validateIdBloodBankCenter(body.bloodBankCenterId);

  if (!body.componentCode) {
    body.componentCode = await uinServiceFactory.generateUIN(
      BloodBankUinShortCode.COM,
    );
  }

  const bloodComponent = await getByUnique({
    model: "BloodComponent",
    where: {
      componentName: body.componentName,
      NOT: body.id ? { id: body.id } : undefined,
    },
  });

  if (bloodComponent) {
    throw new ErrorHandler(
      400,
      generateErrorMessage("DUPLICATE_ITEM", "Blood Component"),
    );
  }

  logger.info(
    "exiting::createOrUpdateBloodComponentServiceValidation::service::validation",
  );
};

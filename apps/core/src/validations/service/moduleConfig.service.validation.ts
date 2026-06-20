import { getAllModulesFromDb } from "@/repository/moduleConfig.repository.js";
import { CreateOrUpdateModuleConfigReq } from "@/types/moduleConfig.js";
import { MonoRepoModule } from "@repo/db/generated/prisma/client";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import {
  generateErrorMessage,
  generateValidationErrorMessage,
} from "@repo/shared/utils/responseMessage.utils.js";

export const validateCreateOrUpdateModuleConfigServiceValidation = async (
  data: CreateOrUpdateModuleConfigReq[]
) => {
  logger.info(
    "entering::validateCreateOrUpdateModuleConfig::service::validation"
  );

  const existingModules = await getAllModulesFromDb();

  const validServiceCodes = Object.values(ServiceCode);

  const moduleSet = new Set<ServiceCode>();

  let hasEnabledCoreModule = false;

  for (const item of data) {
    if (!validServiceCodes.includes(item.module as ServiceCode)) {
      throw new ErrorHandler(
        400,
        generateErrorMessage("INVALID_VALUE", "Module")
      );
    }

    if (moduleSet.has(item.module as ServiceCode)) {
      throw new ErrorHandler(
        400,
        generateValidationErrorMessage(
          "DUPLICATE_ITEM",
          `Module ${item.module} in payload`
        )
      );
    }

    moduleSet.add(item.module as ServiceCode);

    // CORE module validation
    if (item.module === ServiceCode.CORE) {
      if (!item.isEnabled) {
        throw new ErrorHandler(400, "CORE module must always be enabled");
      }

      hasEnabledCoreModule = true;
    }

    if (item.id) {
      const existingModule = existingModules.find(
        (module: MonoRepoModule) => module.id === item.id
      );

      if (!existingModule) {
        throw new ErrorHandler(
          404,
          generateErrorMessage("NOT_FOUND", "Module")
        );
      }
    }
  }

  // Ensure CORE module exists in payload
  if (!hasEnabledCoreModule) {
    throw new ErrorHandler(
      400,
      "CORE module with isEnabled=true is required in payload"
    );
  }

  logger.info(
    "exiting::validateCreateOrUpdateModuleConfig::service::validation"
  );
};

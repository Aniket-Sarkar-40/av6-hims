import { requestStorage } from "@repo/platform/config/requestContext.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { ServiceCode } from "@repo/db/generated/prisma/enums.js";
import {
  createOrUpdateModuleConfigInDb,
  getEnabledModulesFromDb,
} from "@/repository/moduleConfig.repository.js";
import { CreateOrUpdateModuleConfigReq } from "@/types/moduleConfig.js";
import { validateCreateOrUpdateModuleConfigServiceValidation } from "@/validations/service/moduleConfig.service.validation.js";
import { decodeToken, encodeToken } from "@repo/shared/utils/auth.utils.js";
import { MonoRepoModule } from "@repo/db/generated/prisma/client";

export const moduleConfigService = {
  async createOrUpdateModuleConfig(data: CreateOrUpdateModuleConfigReq[]) {
    logger.info("entering::createOrUpdateModuleConfig::service");
    await validateCreateOrUpdateModuleConfigServiceValidation(data);
    const moduleConfig = await createOrUpdateModuleConfigInDb(data);

    const activeModules: ServiceCode[] = moduleConfig.map(
      (item) => item.module
    );

    const prevToken = requestStorage.getStore()?.token;
    if (!prevToken) {
      throw new ErrorHandler(401, "User not authenticated");
    }

    const decodedToken = decodeToken(prevToken);
    if (!decodedToken || !decodedToken.uuid) {
      throw new ErrorHandler(401, "Invalid token");
    }
    decodedToken.modules = activeModules;
    const token = encodeToken(decodedToken);
    logger.info("exiting::createOrUpdateModuleConfig::service");
    return token;
  },

  async getEnabledModulesFromDb(): Promise<MonoRepoModule[]> {
    logger.info("entering::getEnabledModulesFromDb::service");
    const activeProjects = await getEnabledModulesFromDb();
    logger.info("exiting::getEnabledModulesFromDb::service");
    return activeProjects;
  },
};

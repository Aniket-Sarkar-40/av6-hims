import { auditProxy } from "@/config/audit.config.js";
import { logger } from "@/utils/logger.utils.js";
import { UinShortCode } from "@prisma/client";

const uinConfigServiceRaw = {
  async getAllEnumCodes(): Promise<string[]> {
    logger.info("entering::getAllEnumCodes::service");

    const prismaArray = Object.values(UinShortCode);

    logger.info("exiting::getAllEnumCodes::service (cache rebuilt)");
    return prismaArray;
  },
};

export const uinConfigService = auditProxy.createAuditedService("uinConfig", uinConfigServiceRaw);

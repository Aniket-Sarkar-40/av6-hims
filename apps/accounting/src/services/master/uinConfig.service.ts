import { auditProxy } from "@/config/audit.config.js";
import { AccUinShortCode } from "@repo/db/generated/prisma/enums.js";
import { logger } from "@repo/platform/logging/logger.js";

const uinConfigServiceRaw = {
  async getAllEnumCodes(): Promise<string[]> {
    logger.info("entering::getAllEnumCodes::service");

    const prismaArray = Object.values(AccUinShortCode);

    logger.info("exiting::getAllEnumCodes::service (cache rebuilt)");
    return prismaArray;
  },
};

export const uinConfigService = auditProxy.createAuditedService(
  "uinConfig",
  uinConfigServiceRaw,
);

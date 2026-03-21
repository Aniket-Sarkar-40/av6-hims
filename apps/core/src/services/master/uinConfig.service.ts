import { auditProxy } from "@/config/audit.config.js";
import { logger } from "@repo/platform/logging/logger.js";
import { CoreUinShortCode } from "@repo/db/generated/prisma/client";

const uinConfigServiceRaw = {
  async getAllEnumCodes(): Promise<string[]> {
    logger.info("entering::getAllEnumCodes::service");

    const prismaArray = Object.values(CoreUinShortCode);

    logger.info("exiting::getAllEnumCodes::service (cache rebuilt)");
    return prismaArray;
  },
};

export const uinConfigService = auditProxy.createAuditedService(
  "uinConfig",
  uinConfigServiceRaw,
);

import { logger } from "@repo/platform/logging/logger.js";
import { BloodBankUinShortCode } from "@repo/db/generated/prisma/client";

export const uinConfigService = {
  async getAllEnumCodes(): Promise<string[]> {
    logger.info("entering::getAllEnumCodes::service");

    const prismaArray = Object.values(BloodBankUinShortCode);

    logger.info("exiting::getAllEnumCodes::service (cache rebuilt)");
    return prismaArray;
  },
};

import { db } from "@repo/db/client";
import { logger } from "@repo/platform/logging/logger.js";

const omitPublic = { cronSecretKey: true } as const;

export const getAllCompanySettingsFromDb = async () => {
  logger.info("entering::getAllCompanySettingsFromDb::repository");
  return db.companySettings.findMany({ omit: omitPublic });
};

import { getAllCompanySettingsFromDb } from "@/repository/companySettings.repository.js";
import { logger } from "@repo/platform/logging/logger.js";

export const companySettingsService = {
  async getAllCompanySettings() {
    logger.info("entering::getAllCompanySettings::service");
    const rows = await getAllCompanySettingsFromDb();
    logger.info("exiting::getAllCompanySettings::service");
    return rows;
  },
};

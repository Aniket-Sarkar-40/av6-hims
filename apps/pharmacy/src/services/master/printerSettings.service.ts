import {
  createPrinterSettingsInDb,
  getPrinterSettingsByCCAndTypeInDb,
  getPrinterSettingsInDb,
  updatePrinterSettingsInDb,
} from "@/repository/master/printerSettings.repository.js";
import {
  CreatePrinterSettings,
  UpdatePrinterSettings,
} from "@/types/master/settings.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import {
  createPrinterSettingsServiceValidation,
  updatePrinterSettingsServiceValidation,
} from "@/validations/service/settings/printerSettings.service.validation.js";
import {
  Printer_Type,
  PrinterSettings,
} from "@repo/db/generated/prisma/client.js";

export const printerSettingService = {
  async createSettings(input: CreatePrinterSettings): Promise<PrinterSettings> {
    logger.info("entering::createSettings::service");

    await createPrinterSettingsServiceValidation(input);
    const created = await createPrinterSettingsInDb(input);

    logger.info("exiting::createSettings::service");
    return created;
  },
  async updateSettings(input: UpdatePrinterSettings): Promise<PrinterSettings> {
    logger.info("entering::updateSettings::service");

    await updatePrinterSettingsServiceValidation(input);
    const updated = await updatePrinterSettingsInDb(input);

    logger.info("exiting::updateSettings::service");
    return updated;
  },
  async getSettings(
    canNullReturnable: boolean = false,
  ): Promise<PrinterSettings[] | null> {
    logger.info("entering::getSettings::service");

    let settings: PrinterSettings[] = [];

    settings = await getPrinterSettingsInDb();

    if (settings.length === 0 && !canNullReturnable) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Settings"),
      );
    }

    logger.info("exiting::getSettings::service");
    return settings;
  },

  async getSettingsByPrinterTypeAndCC(
    ccId: number,
    printerType: Printer_Type,
    canNullReturnable: boolean = false,
  ): Promise<PrinterSettings | null> {
    logger.info("entering::getSettings::service");

    const settings = await getPrinterSettingsByCCAndTypeInDb(ccId, printerType);

    if (!settings && !canNullReturnable) {
      throw new ErrorHandler(
        404,
        generateErrorMessage("NOT_FOUND", "Settings"),
      );
    }

    logger.info("exiting::getSettings::service");
    return settings;
  },
};

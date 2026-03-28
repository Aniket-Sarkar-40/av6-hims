import {
  getPrinterSettingsByCCAndTypeInDb,
  getPrinterSettingsByIdInDb,
} from "@/repository/master/printerSettings.repository.js";
import {
  CreatePrinterSettings,
  UpdatePrinterSettings,
} from "@/types/master/settings.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { validIdCheck } from "@repo/platform/validation/global.validation.js";
import { PrinterSettings } from "@repo/db/generated/prisma/client";
import { validateIdCollectionCenter } from "../master/collectionCenter.service.validation.js";

export const validateIdPrinterSettings = async (
  id: number,
): Promise<PrinterSettings> => {
  logger.info(
    "entering::printerSettingsServiceValidation::service::validation",
  );
  validIdCheck(id);
  const printerSettings = await getPrinterSettingsByIdInDb(id);
  if (!printerSettings) {
    throw new ErrorHandler(
      404,
      generateErrorMessage("NOT_FOUND", "Printer Settings"),
    );
  }
  logger.info("exiting::printerSettingsServiceValidation::service::validation");
  return printerSettings;
};

export const createPrinterSettingsServiceValidation = async (
  body: CreatePrinterSettings,
): Promise<void> => {
  logger.info(
    "entering::printerSettingsServiceValidation::service::validation",
  );

  await validateIdCollectionCenter(body.ccId);

  const isExist = await getPrinterSettingsByCCAndTypeInDb(
    body.ccId,
    body.printerType,
  );
  if (isExist) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Printer Settings with this Collection Center and Printer Type ",
      ),
    );
  }

  logger.info("exiting::printerSettingsServiceValidation::service::validation");

  return;
};

export const updatePrinterSettingsServiceValidation = async (
  body: UpdatePrinterSettings,
): Promise<void> => {
  logger.info(
    "entering::printerSettingsServiceValidation::service::validation",
  );

  await validateIdPrinterSettings(body.id);

  await validateIdCollectionCenter(body.ccId);

  const isExist = await getPrinterSettingsByCCAndTypeInDb(
    body.ccId,
    body.printerType,
  );
  if (isExist && isExist.id !== body.id) {
    throw new ErrorHandler(
      400,
      generateErrorMessage(
        "DUPLICATE_ITEM",
        "Printer Settings with this Collection Center and Printer Type ",
      ),
    );
  }

  logger.info("exiting::printerSettingsServiceValidation::service::validation");

  return;
};

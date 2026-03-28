import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  Printer_Type,
  PrinterSettings,
} from "@repo/db/generated/prisma/client";
import {
  CreatePrinterSettings,
  UpdatePrinterSettings,
} from "@/types/master/settings.js";

export const createPrinterSettingsInDb = async (
  data: CreatePrinterSettings,
): Promise<PrinterSettings> => {
  logger.info("entering::CreatePrinterSettings::repository");
  return db.$transaction(
    async (tx) => {
      return tx.printerSettings.create({
        data: {
          ...data,
          createdBy: requestStorage.getStore()?.user?.id,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const updatePrinterSettingsInDb = async (
  data: UpdatePrinterSettings,
): Promise<PrinterSettings> => {
  logger.info("entering::CreatePrinterSettings::repository");
  const requestContext = requestStorage.getStore();
  const userId = requestContext?.user?.id || 0;

  const omittedData = customOmit<UpdatePrinterSettings, "id">(data, ["id"]);
  return db.$transaction(
    async (tx) => {
      return tx.printerSettings.update({
        where: {
          id: data.id,
        },
        data: {
          ...omittedData.rest,
          updatedBy: userId,
        },
      });
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export const getPrinterSettingsInDb = async (): Promise<PrinterSettings[]> => {
  logger.info("entering::getPrinterSettingsInDb::repository");
  return db.printerSettings.findMany({
    where: {
      isActive: true,
    },
  });
};

export const getPrinterSettingsByIdInDb = async (
  id: number,
): Promise<PrinterSettings | null> => {
  logger.info("entering::getPrinterSettingsInDb::repository");
  return db.printerSettings.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getPrinterSettingsByCCAndTypeInDb = async (
  ccId: number,
  type: Printer_Type,
): Promise<PrinterSettings | null> => {
  logger.info("entering::getPrinterSettingsInDb::repository");
  return db.printerSettings.findFirst({
    where: {
      isActive: true,
      ccId,
      printerType: type,
    },
  });
};

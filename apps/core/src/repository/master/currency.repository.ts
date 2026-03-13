import { Currency } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CurrencyReq } from "@/types/master/currency.js";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createCurrencyInDb = async (
  currency: CurrencyReq
): Promise<Currency> => {
  logger.info("entering::createCurrency::repository");
  const store = requestStorage.getStore();
  return db.currency.create({
    data: omitUndefined({ ...currency, createdBy: store?.user?.id ?? null }),
  });
};

export const getAllCurrencyFromDb = async (): Promise<Currency[]> => {
  logger.info("entering::getAllCurrency::repository");
  return db.currency.findMany({
    where: { isActive: true },
  });
};

export const getCurrencyByIdFromDb = async (
  id: number
): Promise<Currency | null> => {
  logger.info("entering::getCurrencyById::repository");
  return db.currency.findUnique({
    where: { id, isActive: true },
  });
};

export const getCurrencyByCurrencyNameFromDb = async (
  name: string
): Promise<Currency | null> => {
  logger.info("entering::getCurrencyByCurrencyName::repository");
  return db.currency.findFirst({
    where: { name: name },
  });
};
export const getCurrencyByCurrencyCodeNameFromDb = async (
  code: string
): Promise<Currency | null> => {
  logger.info("entering::getCurrencyByCurrencyName::repository");
  return db.currency.findFirst({
    where: { code: code },
  });
};

export const updateCurrencyInDb = async (
  id: number,
  currency: CurrencyReq
): Promise<Currency> => {
  logger.info("entering::updateCurrency::repository");
  const store = requestStorage.getStore();
  return db.currency.update({
    where: { id },
    data: omitUndefined({ ...currency, updatedBy: store?.user?.id ?? null }),
  });
};

export const updateActiveCurrencyInDb = async (
  id: number
): Promise<Currency> => {
  logger.info("entering::updateCurrency::repository");
  return db.currency.update({
    where: { id },
    data: {
      isActive: true,
    },
  });
};

export const deleteCurrencyInDb = async (id: number): Promise<Currency> => {
  logger.info("entering::deleteCurrency::repository");
  return db.currency.update({
    where: { id },
    data: { isActive: false },
  });
};

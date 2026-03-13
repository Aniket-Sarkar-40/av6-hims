import { db } from "@repo/db/client";
import { CollectionCenterReq } from "@/types/master/collectionCenter.js";
import { logger } from "@repo/platform/logging/logger.js";
import { CollectionCenter } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createCollectionCenterInDb = async (
  collectionCenter: CollectionCenterReq
): Promise<CollectionCenter> => {
  logger.info("entering::createCollectionCenterInDb::repository");
  return db.collectionCenter.create({
    data: omitUndefined({
      address: collectionCenter.address,
      colName: collectionCenter.colName,
      barcodePrefix: collectionCenter.barcodePrefix,
      connectionCode: collectionCenter.connectionCode,
      currency: collectionCenter.currency,
      currencySymbol: collectionCenter.currencySymbol,
      dateFormat: collectionCenter.dateFormat,
      diseCode: collectionCenter.diseCode,
      email: collectionCenter.email,
      invoicePrefix: collectionCenter.invoicePrefix,
      langId: collectionCenter.langId,
      phone: collectionCenter.phone,
      testPrefix: collectionCenter.testPrefix,
      timeFormat: collectionCenter.timeFormat,
      timezone: collectionCenter.timezone,
      barcodePrinterName: collectionCenter.barcodePrinterName,
      collectionAbbreviationName: collectionCenter.collectionAbbreviationName,
    }),
  });
};

export const updateCollectionCenterInDb = async (
  collectionCenter: CollectionCenterReq
): Promise<CollectionCenter> => {
  logger.info("entering::updateCollectionCenterInDb::repository");

  return db.collectionCenter.update({
    where: { id: collectionCenter.id! },
    data: omitUndefined({
      address: collectionCenter.address,
      colName: collectionCenter.colName,
      barcodePrefix: collectionCenter.barcodePrefix,
      connectionCode: collectionCenter.connectionCode,
      currency: collectionCenter.currency,
      currencySymbol: collectionCenter.currencySymbol,
      dateFormat: collectionCenter.dateFormat,
      diseCode: collectionCenter.diseCode,
      email: collectionCenter.email,
      invoicePrefix: collectionCenter.invoicePrefix,
      langId: collectionCenter.langId,
      phone: collectionCenter.phone,
      testPrefix: collectionCenter.testPrefix,
      timeFormat: collectionCenter.timeFormat,
      timezone: collectionCenter.timezone,
      barcodePrinterName: collectionCenter.barcodePrinterName,
      collectionAbbreviationName: collectionCenter.collectionAbbreviationName,
    }),
  });
};

export const getCollectionCenterByCollectionCenterNameFromDb = async (
  colName: string
): Promise<CollectionCenter | null> => {
  logger.info(
    "entering::getCollectionCenterByCollectionCenterNameFromDb::repository"
  );
  return db.collectionCenter.findFirst({
    where: { colName, isActive: "true" },
  });
};

export const getCollectionCenterByConnectionCodeFromDb = async (
  connCode: string
): Promise<CollectionCenter | null> => {
  logger.info(
    "entering::getCollectionCenterByConnectionCodeFromDb::repository"
  );
  return db.collectionCenter.findFirst({
    where: { connectionCode: connCode, isActive: "true" },
  });
};

export const getCollectionCenterByIdFromDb = async (
  id: number
): Promise<CollectionCenter | null> => {
  logger.info("entering::getCollectionCenterByIdFromDb::repository");
  return db.collectionCenter.findUnique({
    where: { id, isActive: "true" },
  });
};

export const getAllCollectionCenterFromDb = async (): Promise<
  CollectionCenter[]
> => {
  logger.info("entering::getAllCollectionCenterFromDb::repository");
  return db.collectionCenter.findMany({
    where: {
      isActive: "true",
    },
  });
};

export const getAvailableCollectionCenterFromDb = async (): Promise<
  CollectionCenter[]
> => {
  logger.info("entering::getAllCollectionCenterFromDb::repository");
  return db.collectionCenter.findMany({
    where: {
      isActive: "true",
    },
  });
};

import { db } from "@repo/db";
import { BinaryFlag, CollectionCenter } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getCollectionCenterByIdFromDb = async (
  id: number,
): Promise<CollectionCenter | null> => {
  logger.info("entering::getCollectionCenterByIdFromDb::repository");
  return db.collectionCenter.findFirst({
    where: {
      id,
      isActive: BinaryFlag.true,
    },
  });
};

export const getAllCollectionCentersFromDb = async (): Promise<
  CollectionCenter[]
> => {
  logger.info("entering::getAllCollectionCentersFromDb::repository");
  return db.collectionCenter.findMany({
    where: {
      isActive: BinaryFlag.true,
    },
  });
};

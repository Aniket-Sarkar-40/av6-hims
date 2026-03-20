import { db } from "@repo/db/client";
import { BinaryFlag } from "@repo/db/generated/prisma/client";

export const getCountCollectionCenterFromDb = async (ccIds: number[]) => {
  return db.collectionCenter.findMany({
    where: {
      id: { in: ccIds },
      isActive: BinaryFlag.true,
    },
  });
};

export const getCollectionCenterByIdFromDb = async (id: number) => {
  return db.collectionCenter.findFirst({
    where: {
      id,
      isActive: BinaryFlag.true,
    },
  });
};

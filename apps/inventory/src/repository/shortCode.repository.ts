import { logger } from "@/utils/logger.utils";
import db from "../db/client";
import { DynamicShortCode } from "@prisma/client";

export const getShortCodeByCodeFromDb = async (code: string): Promise<DynamicShortCode | null> => {
  logger.info("entering::getShortCodeByCodeFromDb::repository");
  return db.dynamicShortCode.findUnique({
    where: { shortCode: code },
  });
};

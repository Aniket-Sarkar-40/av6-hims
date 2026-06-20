import { db } from "@repo/db";
import { Country } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const getAllCountryFromDb = async (): Promise<Country[]> => {
  logger.info("entering::getAllCountryFromDb::repository");
  return db.country.findMany();
};

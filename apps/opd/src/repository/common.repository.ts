import { createCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

export const fetchTableData = async (table: string) => {
  // Check if data is already cached in Redis
  logger.info("entering::fetchTableData::repository");
  // @ts-expect-error dynamic model
  const model = db[table];
  if (!model) {
    // throw new ErrorHandler(400, "Invalid mapping table name");
    throw new Error("Invalid mapping table name"); // Placeholder for actual error handling
  }

  // If not cached, fetch from DB
  let dbData;
  if (
    table === "staffDesignation" ||
    table === "department" ||
    table === "emailConfig"
  ) {
    dbData = await model.findMany({
      where: { isActive: "yes" },
    });
  } else if (table === "dynamicShortCode" || table === "iCDTen") {
    dbData = await model.findMany();
  } else if (table === "collectionCenter") {
    dbData = await model.findMany({
      where: { isActive: "true" },
    });
  } else if (table === "staff") {
    dbData = await model.findMany({
      where: { isActive: 1 },
    });
  } else {
    dbData = await model.findMany({
      where: { isActive: true },
    });
  }

  await createCache(table, dbData);

  logger.info("exiting::fetchTableData::repository");

  return dbData;
};

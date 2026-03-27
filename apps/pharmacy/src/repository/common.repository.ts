import { db } from "@repo/db";
import { createCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";

const tableWhereMap: Record<string, Record<string, unknown> | null> = {
  // string "yes"
  staffDesignation: { isActive: "yes" },
  department: { isActive: "yes" },
  incomeHead: { isActive: "yes" },
  expenseHead: { isActive: "yes" },
  emailConfig: { isActive: "yes" },
  expense: { isActive: "yes" },

  // no isActive filter
  pmsDynamicShortCode: null,
  pmsWarehouse: null,
  pmsBranch: null,
  country: null,

  // string "true"
  collectionCenter: { isActive: "true" },

  // numeric 1
  staff: { isActive: 1 },
};

export const fetchTableData = async (table: string) => {
  logger.info("entering::fetchTableData::repository");
  logger.info(`fetchTableData::table = ${table}`);

  // @ts-expect-error dynamic prisma model access
  const model = db[table];

  if (!model) {
    throw new Error(`Invalid mapping table name: ${table}`);
  }

  const where = tableWhereMap[table];

  const dbData =
    where === undefined || where === null
      ? await model.findMany()
      : await model.findMany({ where });

  await createCache(table, dbData);

  logger.info("exiting::fetchTableData::repository");

  return dbData;
};

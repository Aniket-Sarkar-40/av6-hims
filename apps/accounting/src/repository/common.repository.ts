// import { mappingExport } from "@/mapper/excelExportMapping.js";
// import { mappingImport } from "@/mapper/excelImportMapping.js";

import {
  CommonFindManyInput,
  CommonFindUniqueInput,
  FindFirstResult,
  FindManyResult,
  FullRow,
  ModelName,
} from "@/types/common.js";
import { db } from "@repo/db";
import { PrismaClient } from "@repo/db/generated/prisma/client";
import { createCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";

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
    table === "accDynamicShortCode" ||
    table === "serviceEvent" ||
    table === "eventConfig" ||
    table === "eventNotificationAudit"
  ) {
    dbData = await model.findMany();
  } else {
    dbData = await model.findMany({
      where: { isActive: true },
    });
  }

  await createCache(table, dbData, "acc");

  logger.info("exiting::fetchTableData::repository");

  return dbData;
};

const lowerFirst = <S extends string>(s: S) =>
  (s.charAt(0).toLowerCase() + s.slice(1)) as Uncapitalize<S>;

/**
 * Overload 1: no args -> return plain model type (Brand | null)
 */
export async function getByUnique<M extends ModelName>(
  input: Omit<CommonFindUniqueInput<M>, "args"> & { args?: undefined }
): Promise<FullRow<M> | null>;

/**
 * Overload 2: args present -> return Prisma computed type (PayloadToResult... | null)
 */
export async function getByUnique<M extends ModelName>(
  input: CommonFindUniqueInput<M>
): Promise<FindFirstResult<M>>;

/**
 * Implementation
 */
export async function getByUnique<M extends ModelName>({
  model,
  useActiveFlag = true,
  where,
  args,
}: CommonFindUniqueInput<M>) {
  const delegateKey = lowerFirst(model) as keyof PrismaClient;
  const delegate = (db as any)[delegateKey];

  if (!delegate?.findFirst) {
    throw new ErrorHandler(
      500,
      `Model delegate "${String(delegateKey)}" not found on PrismaClient`
    );
  }

  return delegate.findFirst({
    where: {
      ...(where ?? {}),
      ...(useActiveFlag ? { isActive: true } : {}),
    },
    ...(args ?? {}),
  });
}

/**
 * Overload 1: no args => returns plain model rows (Brand[] etc.)
 */
export async function getAll<M extends ModelName>(
  input: Omit<CommonFindManyInput<M>, "args"> & { args?: undefined }
): Promise<FullRow<M>[]>;

/**
 * Overload 2: args present => returns computed Prisma result array
 */
export async function getAll<M extends ModelName>(
  input: CommonFindManyInput<M>
): Promise<FindManyResult<M>>;

/**
 * Implementation
 */
export async function getAll<M extends ModelName>({
  model,
  useActiveFlag = true,
  where,
  args,
}: CommonFindManyInput<M>) {
  const delegateKey = lowerFirst(model) as keyof PrismaClient;
  const delegate = (db as any)[delegateKey];

  if (!delegate?.findMany) {
    throw new Error(
      `Model delegate "${String(delegateKey)}" not found on PrismaClient`
    );
  }

  return delegate.findMany({
    where: {
      ...(where ?? {}),
      ...(useActiveFlag ? { isActive: true } : {}),
    },
    ...(args ?? {}),
  });
}

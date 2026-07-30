import {
  CommonActiveInactiveRequestRepository,
  CommonFindManyInput,
  CommonFindUniqueInput,
  FindFirstResult,
  FindManyResult,
  FullRow,
  LockUnlockRequestRepository,
  ModelName,
} from "@/types/common.js";
import { db } from "@repo/db/client";
import {
  BloodBankDynamicShortCode,
  PrismaClient,
} from "@repo/db/generated/prisma/client";
import { createCache } from "@repo/platform/cache/redis.utils.js";
import { logger } from "@repo/platform/logging/logger.js";
import ErrorHandler from "@repo/shared/utils/errorHandler.utils.js";
import { generateErrorMessage } from "@repo/shared/utils/responseMessage.utils.js";
import { FetchRequestRepository } from "av6-core-v2";

export const commonLockUnlock = async ({
  id,
  shortCodeData,
}: LockUnlockRequestRepository) => {
  logger.info("entering::commonLock::repository");

  const tableName = shortCodeData.tableName;
  // @ts-expect-error dynamic model
  const model = db[tableName];

  if (!model) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_TABLE"));
  }

  const currentRecord = await model.findUnique({
    where: { id },
    select: { isLock: true },
  });

  if (!currentRecord) {
    throw new ErrorHandler(404, "Record not found");
  }

  const updatedRecord = await model.update({
    where: { id },
    data: {
      isLock: !currentRecord.isLock,
    },
  });

  logger.info("exiting::commonLock::repository");
  return updatedRecord;
};

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
  if (table === "bloodBankDynamicShortCode") {
    dbData = await model.findMany();
  } else {
    dbData = await model.findMany({
      where: { isActive: true },
    });
  }

  await createCache(table, dbData, "blood-bank");

  logger.info("exiting::fetchTableData::repository");

  return dbData;
};

const lowerFirst = <S extends string>(s: S) =>
  (s.charAt(0).toLowerCase() + s.slice(1)) as Uncapitalize<S>;

/**
 * Overload 1: no args -> return plain model type (Brand | null)
 */
export async function getByUnique<M extends ModelName>(
  input: Omit<CommonFindUniqueInput<M>, "args"> & { args?: undefined },
): Promise<FullRow<M> | null>;

/**
 * Overload 2: args present -> return Prisma computed type (PayloadToResult... | null)
 */
export async function getByUnique<M extends ModelName>(
  input: CommonFindUniqueInput<M>,
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
      `Model delegate "${String(delegateKey)}" not found on PrismaClient`,
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
  input: Omit<CommonFindManyInput<M>, "args"> & { args?: undefined },
): Promise<FullRow<M>[]>;

/**
 * Overload 2: args present => returns computed Prisma result array
 */
export async function getAll<M extends ModelName>(
  input: CommonFindManyInput<M>,
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
      `Model delegate "${String(delegateKey)}" not found on PrismaClient`,
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

export const commonFetch = async ({
  id,
  shortCodeData,
}: FetchRequestRepository<BloodBankDynamicShortCode>) => {
  logger.info("entering::commonFetch::repository");
  const tableName = shortCodeData.tableName;

  // @ts-expect-error dynamic model
  const model = db[tableName];

  if (!model) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_TABLE"));
  }
  const results = model.findUnique({
    where: { id, isActive: true },
  });

  logger.info("exiting::commonFetch::repository");
  return results;
};

export const commonActiveInactive = async ({
  id,
  shortCodeData,
  field,
  value,
}: CommonActiveInactiveRequestRepository) => {
  logger.info("entering::commonActiveInactive::repository");

  const tableName = shortCodeData.tableName;
  // @ts-expect-error dynamic model
  const model = db[tableName];

  if (!model) {
    throw new ErrorHandler(400, generateErrorMessage("INVALID_TABLE"));
  }

  const currentRecord = await model.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!currentRecord) {
    throw new ErrorHandler(404, "Record not found");
  }

  const updatedRecord = await model.update({
    where: { id },
    data: {
      [field]: value,
    },
  });

  logger.info("exiting::commonActiveInactive::repository");
  return updatedRecord;
};

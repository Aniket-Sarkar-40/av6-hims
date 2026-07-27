import {
  CommonFindManyInput,
  CommonFindUniqueInput,
  FindFirstResult,
  FindManyResult,
  FullRow,
  ModelName,
} from "@/types/common.js";
import { logger } from "@repo/platform/logging/logger.js";
import { createCache } from "@repo/platform/cache/redis.utils.js";
import { PrismaClient } from "@repo/db/generated/prisma/client";
import { db } from "@repo/db/client";
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
    table === "staffDesignation" ||
    table === "department" ||
    table === "incomeHead" ||
    table === "expenseHead" ||
    table === "emailConfig" ||
    table === "expense"
  ) {
    dbData = await model.findMany({
      where: { isActive: "yes" },
    });
  } else if (
    table === "coreDynamicShortCode" ||
    table === "warehouse" ||
    table === "branch" ||
    table === "country" ||
    table === "eventConfig" ||
    table === "serviceEvent"
  ) {
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

  await createCache(table, dbData, "core");

  logger.info("exiting::fetchTableData::repository");

  return dbData;
};

const lowerFirst = <S extends string>(s: S) =>
  (s.charAt(0).toLowerCase() + s.slice(1)) as Uncapitalize<S>;

export async function getByUnique<M extends ModelName>(
  input: CommonFindUniqueInput<M>,
): Promise<FindFirstResult<M> | null> {
  const { model, useActiveFlag = true, where, args } = input;
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

export async function getAll<M extends ModelName>(
  input: CommonFindManyInput<M>,
): Promise<FindManyResult<M>> {
  const { model, useActiveFlag = true, where, args } = input;
  const delegateKey = lowerFirst(model) as keyof PrismaClient;
  const delegate = (db as any)[delegateKey];

  if (!delegate?.findMany) {
    throw new Error(
      `Model delegate "${String(delegateKey)}" not found on PrismaClient`,
    );
  }

  // #region agent log
  fetch("http://127.0.0.1:7785/ingest/e8a4682c-45ac-45e7-96ac-931d7abb68a2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "070989",
    },
    body: JSON.stringify({
      sessionId: "070989",
      runId: "getAll-overload-fix",
      hypothesisId: "H-overload",
      location: "apps/core/src/repository/common.repository.ts:getAll",
      message: "getAll called",
      data: {
        model,
        hasArgs: !!args,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return delegate.findMany({
    where: {
      ...(where ?? {}),
      ...(useActiveFlag ? { isActive: true } : {}),
    },
    ...(args ?? {}),
  });
}

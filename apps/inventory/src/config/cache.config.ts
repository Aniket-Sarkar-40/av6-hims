import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  DYNAMIC_SHORT_CODE = "dynamicShortCode",
  ITEM = "item",
  SETTINGS = "settings",
  ITEM_CATEGORY = "itemCategory",
  ITEM_STORE = "itemStore",
  UNIT_MASTER = "unitMaster",
  UIN_CONFIG = "uINConfig",
  TAX_DETAILS = "taxDetails",
  BRANCH = "branch",
  COLLECTION_CENTER = "collectionCenter",
  WAREHOUSE = "warehouse",
  ITEM_SUPPLIER = "itemSupplier",
  EVENT_EMAIL = "eventEmail",
  CURRENCY = "currency",
  STORAGE = "storage",
  INCOME_HEAD = "incomeHead",
  EXPENSE_HEAD = "expenseHead",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}core:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

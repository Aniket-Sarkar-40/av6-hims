import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  DYNAMIC_SHORT_CODE = "invDynamicShortCode",
  ITEM = "invItem",
  SETTINGS = "invSettings",
  ITEM_CATEGORY = "invItemCategory",
  ITEM_STORE = "invItemStore",
  UNIT_MASTER = "invUnitMaster",
  UIN_CONFIG = "invUINConfig",
  TAX_DETAILS = "taxDetails",
  BRANCH = "invBranch",
  COLLECTION_CENTER = "collectionCenter",
  WAREHOUSE = "invWarehouse",
  ITEM_SUPPLIER = "invItemSupplier",
  EVENT_EMAIL = "eventEmail",
  CURRENCY = "currency",
  STORAGE = "invStorage",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}inv:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

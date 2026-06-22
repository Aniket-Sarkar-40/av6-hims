import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  SETTINGS = "bloodBankSettings",
  DYNAMIC_SHORT_CODE = "bloodBankDynamicShortCode",
  UIN_CONFIG = "bloodBankUINConfig",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}blood-bank:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

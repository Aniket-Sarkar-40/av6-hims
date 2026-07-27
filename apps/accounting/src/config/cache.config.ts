import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  CITY = "city",
  STATE = "state",
  COUNTRY = "country",
  COUNTRY_CODE = "country-code",
  SETTINGS = "settings",
  UIN_CONFIG = "accUINConfig",
  AUDIT_CONFIG = "accAuditConfig",
  EMAIL_CONFIG = "accEmailConfig",
  DYNAMIC_SHORT_CODE = "accDynamicShortCode",
  GROUP = "group",
  LEDGER = "ledger",
  VOUCHER_TYPE = "voucherType",
  COST_CENTER = "costCenter",
  NARRATION = "narration",
  CHEQUE_MASTER = "chequeMaster",
  FEATURE_FLAG = "featureFlag",
  RATE_OF_EXCHANGE = "rateOfExchange",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}acc:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  EMAIL_CONFIG = "emailConfig",

  LOGIN = "login",

  SETTINGS = "settings",
  DYNAMIC_SHORT_CODE = "coreDynamicShortCode",

  UIN_CONFIG = "coreUINConfig",

  CITY = "city",
  COUNTRY = "country",
  COUNTRY_CODE = "countryCode",
  STATE = "state",
  ITEM_CATEGORY = "itemCategory",

  COLLECTION_CENTER = "collectionCenter",
  DEPARTMENT = "department",
  STAFF_DESIGNATION = "staffDesignation",
  EMPLOYEE = "employee",
  CURRENCY = "currency",
  SERVICE_EVENT = "serviceEvent",
  TEMPLATE = "template",
  EVENT_CONFIG = "eventConfig",
  PDF_TEMPLATE = "pdfTemplate",

  INCOME_HEAD = "incomeHead",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}core:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

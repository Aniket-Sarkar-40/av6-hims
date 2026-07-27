import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  BRANCH = "pmsBranch",
  COLLECTION_CENTER = "collectionCenter",
  DEPARTMENT = "department",
  DISTRIBUTOR = "distributor",
  DYNAMIC_SHORT_CODE = "pmsDynamicShortCode",
  EMAIL_CONFIG = "emailConfig",
  EVENT_EMAIL = "eventEmail",
  ITEM = "pmsItem",
  LOGIN = "login",
  MANUFACTURE = "manufacture",
  MED_CATEGORY = "medCategory",
  MED_DRUG = "medDrug",
  MED_PACKAGE = "medPackage",
  MED_TYPE = "medType",
  MEDICINE_COMPO = "medicineCompo",
  MEDICINE_UNIT = "medicineUnit",
  SETTINGS = "pmsSettings",
  STAFF = "staff",
  STAFF_DESIGNATION = "staffDesignation",
  STORAGE = "pmsStorage",
  UIN_CONFIG = "pmsUINConfig",
  WAREHOUSE = "pmsWarehouse",
  CUSTOMER = "pmsCustomer",
  CURRENCY = "currency",
  MED_DOSAGE = "medicineDosage",
  MED_DIST_MAP = "medicineDistMap",
  MED_INST = "medicineInstruction",
  STORE = "store",
  EMPLOYEE = "employee",
  BOX_SIZE = "boxSize",
  FEATURE_FLAG = "pmsFeatureFlag",
  AUTO_ALERT_EMAIL = "pmsAutoAlertEmail",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}pms:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

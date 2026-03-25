import { shortCodeService } from "@/services/shortCode.service.js";
import { IS_REDIS, REDIS_PREFIX } from "@repo/shared";

export async function checkIsCacheable(shortCode: string): Promise<boolean> {
  if (!IS_REDIS) return false;
  const tableMetaData = await shortCodeService.getShortCodeByCode(shortCode);

  return tableMetaData && tableMetaData.isCacheable ? true : false;
}

export enum RedisResource {
  SETTINGS = "settings",
  DYNAMIC_SHORT_CODE = "dynamicShortCode",
  UIN_CONFIG = "uinConfig",
  OPD_DEPARTMENT = "opdDepartment",
  OPD_DEPARTMENT_PREFIX = "opdDepartmentPrefix",
  CHIPS_BUTTON_MAPPING = "chipsButtonMapping",
  CONSULTATION_NOTES = "consultationNotes",
  CONSULTATION_NOTES_MAPPING = "consultationNotesMapping",
  MEDICINE_TAB = "medicineTab",
  PROCEDURE = "procedureMaster",
  ICD_TEN = "icdTen",
  GENERAL_BILL_ITEM = "generalBillItem",
}

export const getRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}opd:${RedisResource[resource]}:${type}`;
};

export const getMasterRedisKey = (
  resource: keyof typeof RedisResource,
  type: string,
): string => {
  return `${REDIS_PREFIX}master:${RedisResource[resource]}:${type}`;
};

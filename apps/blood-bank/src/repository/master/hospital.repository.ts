import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { HospitalReq } from "@/types/master/hospital.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  BloodBankUinShortCode,
  Hospital,
} from "@repo/db/generated/prisma/client";
import { ToggleActive } from "av6-core-v2";
import { uinServiceFactory } from "@/config/core.config.js";
import { customOmit } from "av6-utils";

export const createHospitalInDb = async (hospital: HospitalReq) => {
  logger.info("entering::createHospitalInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const hospitalCode =
    hospital.code ??
    (await uinServiceFactory.generateUIN(BloodBankUinShortCode.HOS));
  const omittedData = customOmit<HospitalReq, "code">(hospital, ["code"]);

  return db.hospital.create({
    data: {
      code: hospitalCode,
      ...omittedData.rest,
      countryCode: hospital.countryCode
        ? hospital.countryCode
        : setting?.countryCode,
      createdBy: store?.user?.id,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const updateHospitalInDb = async (hospital: HospitalReq) => {
  logger.info("entering::updateHospitalInDb::repository");
  const store = requestStorage.getStore();
  return db.hospital.update({
    where: { id: hospital.id },
    data: { ...hospital, updatedBy: store?.user?.id },
    include: {
      collectionCenter: true,
    },
  });
};

export const getHospitalByHospitalNameFromDb = async (
  name: string,
): Promise<Hospital | null> => {
  logger.info("entering::getHospitalByHospitalNameFromDb::repository");
  return db.hospital.findFirst({
    where: { name },
  });
};

export const getHospitalByIdFromDb = async (id: number) => {
  logger.info("entering::getHospitalByIdFromDb::repository");
  return db.hospital.findUnique({
    where: { id, isActive: true },
    include: {
      collectionCenter: true,
    },
  });
};

export const getAllHospitalFromDb = async () => {
  logger.info("entering::getAllHospitalFromDb::repository");
  return db.hospital.findMany({
    where: {
      isActive: true,
    },
    include: {
      collectionCenter: true,
    },
  });
};

export const toggleActiveHospital = async (input: ToggleActive) => {
  logger.info("entering::toggleActiveHospital::repository");
  const store = requestStorage.getStore();
  return db.hospital.update({
    where: { id: input.id },
    data: {
      isActive: input.action === "ACTIVE",
      updatedBy: store?.user?.id,
    },
    include: {
      collectionCenter: true,
    },
  });
};

// hospital.repository.ts
export const getHospitalsByCcIdsFromDb = async (ccIds: number[]) => {
  logger.info("entering::getHospitalsByCcIdsFromDb::repository");
  if (!ccIds.length) return [];
  return db.hospital.findMany({
    where: {
      isActive: true,
      id: { in: ccIds }, // <-- key part
    },
    include: { collectionCenter: true },
  });
};

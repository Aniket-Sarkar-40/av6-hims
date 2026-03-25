import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { MedicineDistMapReq } from "@/types/master/medicineDistMap.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  MedicineDistributorMap,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { applyRound } from "av6-utils";

export const createMedicineDistMapInDb = async (
  medicineDistMap: MedicineDistMapReq,
): Promise<MedicineDistributorMap> => {
  logger.info("entering::createMedicineDistMapInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  return db.medicineDistributorMap.create({
    data: {
      ...medicineDistMap,
      price: applyRound(medicineDistMap.price, RoundFormat.TO_FIXED, precision),
      createdBy: store?.user?.id,
      expiryDate: medicineDistMap.expiryDate
        ? new Date(medicineDistMap.expiryDate)
        : undefined,
    },
  });
};

export const updateMedicineDistMapInDb = async (
  medicineDistMap: MedicineDistMapReq,
): Promise<MedicineDistributorMap> => {
  logger.info("entering::updateMedicineDistMapInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  return db.medicineDistributorMap.update({
    where: { id: medicineDistMap.id },
    data: {
      ...medicineDistMap,
      price: applyRound(medicineDistMap.price, RoundFormat.TO_FIXED, precision),
      updatedBy: store?.user?.id,
    },
  });
};

export const getMedicineDistMapByIdFromDb = async (
  id: number,
): Promise<MedicineDistributorMap | null> => {
  logger.info("entering::getMedicineDistMapByIdFromDb::repository");
  return db.medicineDistributorMap.findUnique({
    where: { id, isActive: true },
  });
};

export const findByItemAndDistributor = async (
  itemId: number,
  distributorId: number,
) => {
  return db.medicineDistributorMap.findFirst({
    where: {
      itemId,
      distributorId,
      isActive: true,
    },
  });
};

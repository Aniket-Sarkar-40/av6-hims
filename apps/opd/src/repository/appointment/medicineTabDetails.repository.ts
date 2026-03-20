import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateMedicineTabDetails,
  UpdateMedicineTabDetailsInput,
} from "@/types/appointment/medicineTabDetails.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineTabDetails } from "@repo/db/generated/prisma/client";

export const createMedicineTabDetailsInDb = async (
  input: CreateMedicineTabDetails,
): Promise<MedicineTabDetails[]> => {
  logger.info("entering::createMedicineTabDetailsInDb::repository");
  const userId = requestStorage.getStore()?.user?.id ?? null;

  const createdRows = await db.$transaction(async (tx) => {
    return Promise.all(
      input.data.map((row) =>
        tx.medicineTabDetails.create({
          data: {
            ...row,
            medicineTabId: input.medicineTabId,
            createdBy: userId,
          },
        }),
      ),
    );
  });

  logger.info("exiting::createMedicineTabDetailsInDb::repository");
  return createdRows;
};

export const updateMedicineTabDetailsInDb = async (
  input: UpdateMedicineTabDetailsInput,
): Promise<MedicineTabDetails[]> => {
  logger.info("entering::updateMedicineTabDetailsInDb::repository");
  const userId = requestStorage.getStore()?.user?.id ?? undefined;
  const { medicineTabId, data, existingMedicine } = input;

  const toUpdate = data.filter((item) => item.id);
  const toCreate = data.filter((item) => !item.id);
  const toDeleteIds = existingMedicine
    .filter((d) => !data.some((i) => i.id === d.id))
    .map((d) => d.id);

  const result = await db.$transaction(async (tx) => {
    const updated = await Promise.all(
      toUpdate.map(({ id, ...rest }) =>
        tx.medicineTabDetails.update({
          where: { id },
          data: { ...rest, updatedBy: userId },
        }),
      ),
    );

    const created = await Promise.all(
      toCreate.map((row) =>
        tx.medicineTabDetails.create({
          data: {
            ...customOmit(row, ["id"]).rest,
            medicineTabId,
            createdBy: userId,
          },
        }),
      ),
    );

    if (toDeleteIds.length)
      await tx.medicineTabDetails.updateMany({
        where: { id: { in: toDeleteIds } },
        data: { isActive: false, deletedBy: userId, deletedAt: new Date() },
      });

    return [...updated, ...created];
  });

  logger.info("exiting::updateMedicineTabDetailsInDb::repository");
  return result;
};

export const getAllMedicineTabDetailsFromDb = async (): Promise<
  MedicineTabDetails[]
> => {
  logger.info("entering::getAllMedicineTabDetailsFromDb::repository");

  const rows = await db.medicineTabDetails.findMany({
    where: { isActive: true },
    include: {
      medicineTab: true,
    },
  });

  logger.info("exiting::getAllMedicineTabDetailsFromDb::repository");
  return rows;
};

export const getMedicineTabDetailsByMedicineTabIdFromDb = async (
  medicineTabId: number,
): Promise<MedicineTabDetails[] | null> => {
  logger.info(`entering::getMedicineTabDetailsByIdFromDb::repository`);

  const row = await db.medicineTabDetails.findMany({
    where: { medicineTabId, isActive: true },
    include: { medicineTab: true },
  });

  logger.info(`exiting::getMedicineTabDetailsByIdFromDb::repository`);
  return row;
};

export const getMedicineTabIdAndMedIdByIdFromDb = async (
  id: number,
  medId: number,
): Promise<MedicineTabDetails | null> => {
  logger.info(`entering::getMedicineTabIdAndMedIdByIdFromDb::repository`);

  return await db.medicineTabDetails.findFirst({
    where: {
      medId,
      isActive: true,
      medicineTab: {
        id,
        isActive: true,
      },
    },
  });
};

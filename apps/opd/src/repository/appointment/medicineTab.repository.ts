import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateMedicineTab } from "@/types/appointment/medicineTab.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineTab } from "@repo/db/generated/prisma/client";

export const createMedicineTabInDb = async (
  data: CreateOrUpdateMedicineTab,
): Promise<MedicineTab> => {
  logger.info("entering::createMedicineTabInDb::repository");
  const store = requestStorage.getStore();
  const { rest } = customOmit<CreateOrUpdateMedicineTab, "id">(data, ["id"]);
  return db.medicineTab.create({
    data: {
      ...rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateMedicineTabInDb = async (
  data: CreateOrUpdateMedicineTab,
): Promise<MedicineTab> => {
  logger.info("entering::updateMedicineTabInDb::repository");
  const store = requestStorage.getStore();

  return db.medicineTab.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};

export const getMedicineTabByNameAndDoctorFromDb = async (
  medTabName: string,
  doctorId: number,
): Promise<MedicineTab | null> => {
  logger.info("entering::getMedicineTabByNameAndDoctorFromDb::repository");
  return db.medicineTab.findFirst({
    where: { medTabName, doctorId, isActive: true },
  });
};

export const getMedicineTabByIdFromDb = async (
  id: number,
): Promise<MedicineTab | null> => {
  logger.info("entering::getMedicineTabByIdFromDb::repository");
  return db.medicineTab.findFirst({
    where: { id, isActive: true },
  });
};

export const deleteMedicineTabFromDb = async (id: number): Promise<void> => {
  logger.info(`entering::deleteMedicineTabFromDb::repository`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id ?? null;

  await db.$transaction(async (tx) => {
    await tx.medicineTab.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });

    await tx.medicineTabDetails.updateMany({
      where: { medicineTabId: id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: currentUser,
      },
    });
  });

  logger.info(`exiting::deleteMedicineTabFromDb::repository`);
};

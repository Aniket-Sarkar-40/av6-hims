import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { InstructionName } from "@/types/master/dropDownName.js";
import { logger } from "@repo/platform/logging/logger.js";
import { MedicineInstruction } from "@repo/db/generated/prisma/client";

export const createMedInstructionInDb = async (
  inst: InstructionName,
): Promise<MedicineInstruction> => {
  logger.info("entering::createMedInstructionInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineInstruction.create({
    data: { ...inst, createdBy: store?.user?.id },
  });
};

export const getAllMedInstructionFromDb = async () => {
  logger.info("entering::getAllMedInstructionFromDb::repository");
  return db.medicineInstruction.findMany({
    where: { isActive: true },
  });
};

export const getMedInstructionByIdFromDb = async (id: number) => {
  logger.info("entering::getMedInstructionByIdFromDb::repository");
  return db.medicineInstruction.findUnique({
    where: { id, isActive: true },
  });
};

export const getMedInstructionByNameFromDb = async (
  name: string,
): Promise<MedicineInstruction | null> => {
  logger.info("entering::getMedInstructionByNameFromDb::repository");
  return db.medicineInstruction.findFirst({
    where: { instructionName: name, isActive: true },
  });
};

export const updateMedInstructionInDb = async (input: InstructionName) => {
  logger.info("entering::updateMedInstructionInDb::repository");
  const store = requestStorage.getStore();
  return db.medicineInstruction.update({
    where: {
      id: input.id,
    },
    data: {
      updatedBy: store?.user?.id,
      instructionName: input.instructionName,
    },
  });
};

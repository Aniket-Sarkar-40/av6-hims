import { db } from "@repo/db";
import { CreateStaffDesignationInput } from "@/types/staff/designation.js";
import { logger } from "@repo/platform/logging/logger.js";
import { StaffDesignation } from "@repo/db/generated/prisma/client";

export const createStaffDesignationInDb = async (
  staffDesignation: CreateStaffDesignationInput,
): Promise<StaffDesignation> => {
  logger.info("entering::createStaffDesignationInDb::repository");
  return db.staffDesignation.create({
    data: { ...staffDesignation, isActive: "yes" },
  });
};

export const getAllDesignationsFromDb = async (): Promise<
  StaffDesignation[]
> => {
  logger.info("entering::getAllDesignationsFromDb::repository");
  return db.staffDesignation.findMany({
    where: {
      isActive: "yes",
    },
  });
};

export const getStaffDesignationByIdFromDb = async (
  id: number,
): Promise<StaffDesignation | null> => {
  logger.info("entering::getStaffDesignationByIdFromDb::repository");
  return db.staffDesignation.findUnique({
    where: { id, isActive: "yes" },
  });
};
export const getStaffDesignationByStaffDesignationNameFromDb = async (
  name: string,
): Promise<StaffDesignation | null> => {
  logger.info(
    "entering::getStaffDesignationByStaffDesignationNameFromDb::repository",
  );
  return db.staffDesignation.findFirst({
    where: { designation: name, isActive: "yes" },
  });
};

export const updateStaffDesignationInDb = async (
  id: number,
  staffDesignation: CreateStaffDesignationInput,
): Promise<StaffDesignation> => {
  logger.info("entering::updateStaffDesignationInDb::repository");

  return db.staffDesignation.update({
    where: { id },
    data: { ...staffDesignation },
  });
};

export const deleteStaffDesignationInDb = async (
  id: number,
): Promise<StaffDesignation> => {
  logger.info("entering::deleteStaffDesignationInDb::repository");
  return db.staffDesignation.update({
    where: { id },
    data: { isActive: "no" },
  });
};

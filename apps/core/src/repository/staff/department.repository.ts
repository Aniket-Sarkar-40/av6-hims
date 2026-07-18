import { db } from "@repo/db/client";
import { CreateDepartmentInput } from "@/types/staff/department.js";
import { Department, YesNoFlag } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { toDepartmentCreateData } from "@/mapper/staff/department.mapper.js";

export const createDepartmentInDb = async (
  department: CreateDepartmentInput,
): Promise<Department> => {
  logger.info("entering::createDepartment::repository");

  const deptData = toDepartmentCreateData(department);

  return db.department.create({
    data: deptData,
  });
};

export const getAllDepartmentsFromDb = async (): Promise<Department[]> => {
  logger.info("entering::getAllDepartmentsFromDb::repository");
  return db.department.findMany({
    where: { isActive: YesNoFlag.yes },
  });
};

export const getDepartmentByIdFromDb = async (
  id: number,
): Promise<Department | null> => {
  logger.info("entering::getDepartmentById::repository");
  return db.department.findUnique({
    where: { id, isActive: YesNoFlag.yes },
  });
};

export const getDepartmentByDepartmentNameFromDb = async (
  departmentName: string,
): Promise<Department | null> => {
  logger.info("entering::getDepartmentById::repository");
  return db.department.findFirst({
    where: { name: departmentName, isActive: YesNoFlag.yes },
  });
};

export const updateDepartmentInDb = async (
  id: number,
  department: CreateDepartmentInput,
): Promise<Department> => {
  logger.info("entering::updateDepartment::repository");

  const deptData = toDepartmentCreateData(department);

  return db.department.update({
    where: { id },
    data: {
      ...deptData,
    },
  });
};

export const deleteDepartmentInDb = async (id: number): Promise<void> => {
  logger.info("entering::deleteDepartment::repository");

  await db.department.update({
    where: { id },
    data: { isActive: YesNoFlag.no },
  });
};

import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateOpdDepartment } from "@/types/master/opdDepartment.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  DepartmentType,
  OpdDepartment,
} from "@repo/db/generated/prisma/client";

export const createOpdDepartmentInDb = async (
  data: CreateOrUpdateOpdDepartment,
): Promise<OpdDepartment> => {
  logger.info("entering::createOpdDepartmentInDb::repository");
  const store = requestStorage.getStore();
  const opdDepartmentOmit = customOmit<CreateOrUpdateOpdDepartment, "id">(
    data,
    ["id"],
  );
  return db.opdDepartment.create({
    data: {
      ...opdDepartmentOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateOpdDepartmentInDb = async (
  data: CreateOrUpdateOpdDepartment,
): Promise<OpdDepartment> => {
  logger.info("entering::updateOpdDepartmentInDb::repository");
  const store = requestStorage.getStore();
  return db.opdDepartment.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};

export const getOpdDepartmentByNameFromDb = async (
  departmentName: string,
): Promise<OpdDepartment | null> => {
  logger.info("entering::getOpdDepartmentByNameFromDb::repository");
  return db.opdDepartment.findFirst({
    where: { departmentName, isActive: true },
  });
};

export const getOpdDepartmentByIdFromDb = async (
  id: number,
): Promise<OpdDepartment | null> => {
  logger.info("entering::getOpdDepartmentByIdFromDb::repository");
  return db.opdDepartment.findFirst({
    where: { id, isActive: true },
  });
};

export const getPrimaryOpdDepartmentByIdFromDb = async (
  id: number,
): Promise<OpdDepartment | null> => {
  logger.info("entering::getPrimaryOpdDepartmentByIdFromDb::repository");
  return db.opdDepartment.findFirst({
    where: {
      id,
      isActive: true,
      departmentType: DepartmentType.PRIMARY,
    },
  });
};
export const getSecondaryOpdDepartmentByIdFromDb = async (
  id: number,
): Promise<OpdDepartment | null> => {
  logger.info("entering::getSecondaryOpdDepartmentByIdFromDb::repository");
  return db.opdDepartment.findFirst({
    where: {
      id,
      isActive: true,
      departmentType: DepartmentType.SECONDARY,
    },
  });
};

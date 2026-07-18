import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateOrUpdateOpdDepartmentPrefix } from "@/types/master/opdDepartmentPrefix.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { OpdDepartmentPrefix } from "@repo/db/generated/prisma/client";

export const createOpdDepartmentPrefixInDb = async (
  data: CreateOrUpdateOpdDepartmentPrefix,
): Promise<OpdDepartmentPrefix> => {
  logger.info("entering::createOpdDepartmentInDb::repository");
  const store = requestStorage.getStore();
  const opdDepartmentOmit = customOmit<CreateOrUpdateOpdDepartmentPrefix, "id">(
    data,
    ["id"],
  );
  return db.opdDepartmentPrefix.create({
    data: {
      ...opdDepartmentOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const updateOpdDepartmentPrefixInDb = async (
  data: CreateOrUpdateOpdDepartmentPrefix,
): Promise<OpdDepartmentPrefix> => {
  logger.info("entering::updateOpdDepartmentInDb::repository");
  const store = requestStorage.getStore();
  return db.opdDepartmentPrefix.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};

export const getOpdDepartmentPrefixByNameFromDb = async (
  prefix: string,
  opdDepartmentId: number,
): Promise<OpdDepartmentPrefix | null> => {
  logger.info("entering::getOpdDepartmentByNameFromDb::repository");
  return db.opdDepartmentPrefix.findFirst({
    where: { prefix: prefix, opdDepartmentId, isActive: true },
  });
};

export const getOpdDepartmentPrefixByIdFromDb = async (
  id: number,
): Promise<OpdDepartmentPrefix | null> => {
  logger.info("entering::getOpdDepartmentByIdFromDb::repository");
  return db.opdDepartmentPrefix.findUnique({
    where: { id, isActive: true },
  });
};

export const getOpdDepartmentPrefixByDepartmentIdFromDb = async (
  opdDepartmentId: number,
): Promise<OpdDepartmentPrefix[]> => {
  logger.info(
    "entering::getOpdDepartmentPrefixByDepartmentIdFromDb::repository",
  );
  return db.opdDepartmentPrefix.findMany({
    where: { opdDepartmentId, isActive: true },
  });
};

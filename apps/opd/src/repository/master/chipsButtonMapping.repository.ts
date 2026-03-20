import { db } from "@repo/db/client";
import { CreateOrUpdateChipsButtonMapping } from "@/types/master/chipsButtonMapping.js";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { ChipsButtonMapping } from "@repo/db/generated/prisma/client";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";

export const createChipsButtonMappingInDb = async (
  data: CreateOrUpdateChipsButtonMapping,
) => {
  logger.info("entering::createChipsButtonMappingInDb::repository");
  const store = requestStorage.getStore();
  const chipsButtonMappingOmit = customOmit<
    CreateOrUpdateChipsButtonMapping,
    "id"
  >(data, ["id"]);
  return db.chipsButtonMapping.create({
    data: {
      ...chipsButtonMappingOmit.rest,
      createdBy: store?.user?.id,
    },
  });
};

export const getChipsButtonMappingByIdFromDb = async (
  id: number,
): Promise<ChipsButtonMapping | null> => {
  logger.info("entering::getChipsButtonMappingByIdFromDb::repository");
  return db.chipsButtonMapping.findFirst({
    where: { id, isActive: true },
  });
};

export const getChipsButtonMappingByNameFromDb = async (
  chipsName: string,
): Promise<ChipsButtonMapping | null> => {
  logger.info("entering::getChipsButtonMappingByNameFromDb::repository");
  return db.chipsButtonMapping.findFirst({
    where: { chipsName, isActive: true },
  });
};

export const getChipsButtonMappingByDoctorAndNameFromDb = async (
  doctorId: number,
  chipsName: string,
): Promise<ChipsButtonMapping | null> => {
  return await db.chipsButtonMapping.findFirst({
    where: {
      doctorId,
      chipsName,
      isActive: true,
    },
  });
};

export const updateChipsButtonMappingInDb = async (
  data: CreateOrUpdateChipsButtonMapping,
) => {
  logger.info("entering::updateChipsButtonMappingInDb::repository");
  const store = requestStorage.getStore();
  return db.chipsButtonMapping.update({
    where: { id: data.id },
    data: {
      ...data,
      updatedBy: store?.user?.id,
    },
  });
};

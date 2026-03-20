import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateGeneralBillItemMasterInput,
  UpdateGeneralBillItemMasterInput,
} from "@/types/master/generalBillItem.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { GeneralBillItem } from "@repo/db/generated/prisma/client";

export const createGeneralBillItemInDb = async (
  input: CreateGeneralBillItemMasterInput,
): Promise<GeneralBillItem> => {
  logger.info("entering::createGeneralBillItemInDb::repository");
  const store = requestStorage.getStore();
  return db.generalBillItem.create({
    data: {
      ...input,
      createdBy: store?.user?.id,
    },
  });
};

export const updateGeneralBillItemInDb = async (
  input: UpdateGeneralBillItemMasterInput,
): Promise<GeneralBillItem> => {
  logger.info("entering::updateGeneralBillItemInDb::repository");
  const store = requestStorage.getStore();
  const omittedInput = customOmit<UpdateGeneralBillItemMasterInput, "id">(
    input,
    ["id"],
  );
  return db.generalBillItem.update({
    where: {
      id: input.id,
    },
    data: {
      ...omittedInput.rest,
      updatedBy: store?.user?.id,
    },
  });
};

export const getGeneralBillItemByIdFromDb = async (
  id: number,
): Promise<GeneralBillItem | null> => {
  logger.info("entering::getGeneralBillItemByIdFromDb::repository");
  return db.generalBillItem.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getGeneralBillItemFromDb = async (): Promise<
  GeneralBillItem[]
> => {
  logger.info("entering::getGeneralBillItemFromDb::repository");
  return db.generalBillItem.findMany({
    where: {
      isActive: true,
    },
  });
};

export const getGeneralBillItemByNameFromDb = async (
  name: string,
): Promise<GeneralBillItem | null> => {
  logger.info("entering::getGeneralBillItemByNameFromDb::repository");
  return db.generalBillItem.findFirst({
    where: {
      name,
      isActive: true,
    },
  });
};

export const getAllGeneralBillItemFromDb = async (): Promise<
  GeneralBillItem[]
> => {
  logger.info("entering::getAllGeneralBillItemFromDb::repository");
  return db.generalBillItem.findMany({
    where: {
      isActive: true,
    },
  });
};

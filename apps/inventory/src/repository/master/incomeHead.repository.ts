import { db } from "@repo/db/client";
import {
  CreateIncomeHeadInput,
  UpdateIncomeHeadInput,
} from "@/types/master/incomeHead.js";
import { logger } from "@repo/platform/logging/logger.js";
import { IncomeHead, YesNoFlag } from "@repo/db/generated/prisma/client";

export const createIncomeHeadInDb = async (
  incomeHead: CreateIncomeHeadInput,
): Promise<IncomeHead> => {
  logger.info("entering::createIncomeHeadInDb::repository");
  return db.incomeHead.create({
    data: incomeHead,
  });
};

export const updateIncomeHeadInDb = async (
  incomeHead: UpdateIncomeHeadInput,
): Promise<IncomeHead> => {
  logger.info("entering::updateIncomeHeadInDb::repository");
  return db.incomeHead.update({
    where: { id: incomeHead.id },
    data: incomeHead,
  });
};

export const getIncomeHeadByIncomeHeadNameFromDb = async (
  incomeCategory: string,
): Promise<IncomeHead | null> => {
  logger.info("entering::getIncomeHeadByIncomeHeadNameFromDb::repository");
  return db.incomeHead.findFirst({
    where: { incomeCategory, isActive: YesNoFlag.yes },
  });
};

export const getIncomeHeadByIdFromDb = async (
  id: number,
): Promise<IncomeHead | null> => {
  logger.info("entering::getIncomeHeadByIdFromDb::repository");
  return db.incomeHead.findUnique({
    where: { id, isActive: YesNoFlag.yes },
  });
};

export const getAllIncomeHeadFromDb = async (): Promise<IncomeHead[]> => {
  logger.info("entering::getAllIncomeHeadFromDb::repository");
  return db.incomeHead.findMany({
    where: { isActive: YesNoFlag.yes },
  });
};

export const deleteIncomeHeadInDb = async (id: number) => {
  logger.info("entering::deleteIncomeHeadInDb::repository");
  return db.incomeHead.update({
    where: { id },
    data: { isActive: YesNoFlag.no, isDeleted: YesNoFlag.yes },
  });
};

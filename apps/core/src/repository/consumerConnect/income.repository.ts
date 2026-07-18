import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import { CreateIncomeInput } from "@/types/consumerConnect/income.js";
import { logger } from "@repo/platform/logging/logger.js";
import { applyRound, RoundFormat } from "av6-utils";
import { Income, YesNoFlag } from "@repo/db/generated/prisma/client";

export async function getIncomeById(id: number): Promise<Income | null> {
  logger.info("entering::getIncomeById::repository");
  return db.income.findFirst({
    where: { id: id, isActive: YesNoFlag.yes },
  });
}

export const createIncomeInDb = async (
  income: CreateIncomeInput,
): Promise<Income> => {
  logger.info("entering::createIncomeInDb::repository");
  // Exclude 'id' from the data object if present
  const setting = await requestStorage.getStore()?.settings;
  const precision = setting?.defaultPrecision ?? 2;
  return db.income.create({
    data: {
      ...income,
      incHeadId:
        income.incHeadId !== undefined && income.incHeadId !== null
          ? income.incHeadId
          : income.incHeadId,
      amount:
        income.amount !== undefined && income.amount !== null
          ? applyRound(income.amount, RoundFormat.TO_FIXED, precision)
          : null,
    },
  });
};

export const updateIncomeInDb = async (
  id: number,
  income: CreateIncomeInput,
): Promise<Income> => {
  logger.info("entering::updateIncomeInDb::repository");
  const store = requestStorage.getStore();
  const setting = store?.settings;
  const precision = setting?.defaultPrecision;
  return db.income.update({
    where: { id },
    data: {
      ...income,
      incHeadId:
        income.incHeadId !== undefined && income.incHeadId !== null
          ? income.incHeadId
          : income.incHeadId,
      amount:
        income.amount !== undefined && income.amount !== null
          ? applyRound(income.amount, RoundFormat.TO_FIXED, precision)
          : null,
    },
  });
};

export const getIncomeByInvoiceNoFromDb = async (
  invoiceNo: string,
): Promise<Income | null> => {
  logger.info("entering:: getIncomeByInvoiceNoFromDb::repository");
  return db.income.findFirst({
    where: { invoiceNo, isActive: YesNoFlag.yes },
  });
};

export const getAllIncomeFromDb = async (): Promise<Income[]> => {
  logger.info("entering::getAllIncomeFromDb::repository");
  return db.income.findMany({
    where: { isActive: YesNoFlag.yes },
  });
};

export const getIncomeByIdFromDb = async (
  id: number,
): Promise<Income | null> => {
  logger.info("entering::getIncomeByIdFromDb::repository");
  return db.income.findUnique({
    where: { id, isActive: YesNoFlag.yes },
  });
};

export const deleteIncomeInDb = async (id: number): Promise<Income> => {
  logger.info("entering::deleteIncomeInDb::repository");

  return db.income.update({
    where: { id },
    data: {
      isActive: YesNoFlag.no,
      isDeleted: YesNoFlag.yes,
    },
  });
};

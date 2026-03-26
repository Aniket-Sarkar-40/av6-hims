import {
  DbInsuranceWithMapping,
  InsuranceReq,
} from "@/types/insurance/insurance.js";
import { db } from "@repo/db";
import { InsuranceMaster } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createInsuranceInDb = async (
  data: InsuranceReq,
): Promise<InsuranceMaster> => {
  logger.info("entering::createInsurance::repository");

  const store = requestStorage.getStore();
  const { id: _id, insuranceBusinessMapping, ...insuranceData } = data;
  const insurance = await db.insuranceMaster.create({
    data: {
      ...insuranceData,
      insuranceBusinessMapping: insuranceBusinessMapping
        ? {
            create: insuranceBusinessMapping.map((ib) => ({
              type: ib.type,
              name: ib.name,
              phone: ib.phone,
              isDefault: ib.isDefault,
              createdBy: store?.user?.id,
            })),
          }
        : undefined,
      createdBy: store?.user?.id,
    },
    include: {
      insuranceBusinessMapping: true,
    },
  });

  logger.info("exiting::createInsurance::repository");

  return insurance;
};

export const updateInsuranceInDb = async (
  id: number,
  data: InsuranceReq,
): Promise<InsuranceMaster> => {
  const store = requestStorage.getStore();
  const insurance = await db.insuranceMaster.update({
    where: {
      id,
    },
    data: {
      ...data,
      insuranceBusinessMapping: {
        upsert:
          data.insuranceBusinessMapping?.map((ib) => ({
            where: {
              id: ib.id,
            },
            create: {
              type: ib.type,
              name: ib.name,
              phone: ib.phone,
              isDefault: ib.isDefault,
              date: ib.date,
            },
            update: {
              type: ib.type,
              name: ib.name,
              phone: ib.phone,
              isDefault: ib.isDefault,
              date: ib.date,
            },
          })) ?? undefined,
      },
      updatedBy: store?.user?.id,
    },
    include: {
      insuranceBusinessMapping: true,
    },
  });

  return insurance;
};

export const getAllInsuranceFromDb = async (): Promise<
  DbInsuranceWithMapping[]
> => {
  logger.info("entering::getAllInsuranceFromDb::repository");

  const allInsurance = await db.insuranceMaster.findMany({
    include: {
      insuranceBusinessMapping: true,
    },
  });

  logger.info("exiting::getAllInsuranceFromDb::repository");
  return allInsurance;
};

export const getInsuranceByIdFromDb = async (
  id: number,
): Promise<DbInsuranceWithMapping | null> => {
  logger.info(`entering::getInsuranceByIdFromDb::repository id=${id}`);

  const insurance = await db.insuranceMaster.findFirst({
    where: { id },
    include: {
      insuranceBusinessMapping: true,
    },
  });

  logger.info(`exiting::getInsuranceByIdFromDb::repository id=${id}`);
  return insurance;
};

export const getInsuranceMobileNoByMobileNoFromDb = async (
  contactNo: string,
): Promise<InsuranceMaster | null> => {
  logger.info(
    `entering::getInsuranceNameByNameFromDb::repository insuranceName=${contactNo}`,
  );

  const insuranceDetails = await db.insuranceMaster.findFirst({
    where: { contactNo },
  });

  logger.info(
    `exiting::getInsuranceNameByNameFromDb::repository insuranceName=${contactNo}`,
  );
  return insuranceDetails;
};

export const getInsuranceEmailByMobileNoFromDb = async (
  email: string,
): Promise<InsuranceMaster | null> => {
  logger.info(
    `entering::getInsuranceNameByNameFromDb::repository insuranceName=${email}`,
  );

  const insuranceDetails = await db.insuranceMaster.findFirst({
    where: { email },
  });

  logger.info(
    `exiting::getInsuranceNameByNameFromDb::repository insuranceName=${email}`,
  );
  return insuranceDetails;
};

export const deleteInsuranceFromDb = async (id: number) => {
  logger.info(`entering::deleteInsuranceFromDb::repository id=${id}`);

  // First, delete the related InsuranceBusinessMapping records
  await db.insuranceBusinessMapping.deleteMany({
    where: { insurerId: id },
  });

  // Then, delete the InsuranceMaster record
  await db.insuranceMaster.delete({
    where: { id },
  });

  logger.info(`exiting::deleteInsuranceFromDb::repository id=${id}`);
};

import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateCountryCode,
  UpdateCountryCode,
} from "@/types/master/countryCode.js";
import { logger } from "@repo/platform/logging/logger.js";
import { CountryCode } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";

export const createCountryCodeInDb = async (
  input: CreateCountryCode
): Promise<CountryCode> => {
  logger.info("entering::createCountryCode::repository");
  const store = requestStorage.getStore();
  return db.countryCode.create({
    data: omitUndefined({
      ...input,
      createdBy: store?.user?.id,
    }),
  });
};

export const updateCountryCodeInDb = async (
  input: UpdateCountryCode
): Promise<CountryCode> => {
  logger.info("entering::updateCountryCode::repository");
  const store = requestStorage.getStore();
  return db.countryCode.update({
    where: {
      id: input.id,
    },
    data: omitUndefined({
      ...input,
      updatedBy: store?.user?.id ?? null,
    }),
  });
};

export const getCountryCodeByNameFromDb = async (
  name: string
): Promise<CountryCode | null> => {
  logger.info("entering::getCountryCodeByName::repository");
  return db.countryCode.findFirst({
    where: {
      countryCode: name,
      isActive: true,
    },
  });
};

export const getCountryCodeByCountryFromDb = async (
  countryId: number
): Promise<CountryCode | null> => {
  logger.info("entering::getCountryCodeByCountry::repository");
  return db.countryCode.findFirst({
    where: {
      countryId,
      isActive: true,
    },
  });
};

export const getCountryCodeByIdFromDb = async (
  id: number
): Promise<CountryCode | null> => {
  logger.info("entering::getCountryCodeById::repository");
  return db.countryCode.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getAllCountryCodeFromDb = async (): Promise<CountryCode[]> => {
  logger.info("entering::getAllCountryCode::repository");
  return db.countryCode.findMany({
    where: {
      isActive: true,
    },
  });
};

export const deleteCountryCodeByIdFromDb = async (id: number) => {
  logger.info("entering::deleteCountryCodeById::repository");
  return db.countryCode.delete({
    where: {
      id,
    },
  });
};

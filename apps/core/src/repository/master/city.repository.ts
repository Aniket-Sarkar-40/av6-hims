import { CreateCityInput, UpdateCityInput } from "@/types/master/city.js";
import { db } from "@repo/db/client";
import { City } from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createCityInDb = async (city: CreateCityInput): Promise<City> => {
  logger.info("entering::createCity::repository");
  const store = requestStorage.getStore();
  return db.city.create({
    data: { ...city, createdBy: store?.user?.id },
  });
};

export const getAllCitiesFromDb = async (): Promise<City[]> => {
  logger.info("entering::createCity::repository");

  return db.city.findMany({
    where: { isActive: true },
  });
};

export const getCityByIdFromDb = async (id: number): Promise<City | null> => {
  logger.info("entering::createCity::repository");

  return db.city.findUnique({
    where: { id, isActive: true },
  });
};
export const getCityByIdFrom = async (id: number): Promise<City | null> => {
  logger.info("entering::createCity::repository");

  return db.city.findUnique({
    where: {
      id,
      isActive: true,
      state: { isActive: true },
    },
    include: {
      state: true,
      country: true,
    },
  });
};

export const getCityWithIncludesFromDB = async (id: number) => {
  logger.info("entering::getCityWithIncludesFromDB::repository");

  return db.city.findFirst({
    where: {
      id: id,
      isActive: true,
      state: { isActive: true },
    },
  });
};

export const getCityByCityNameFromDb = async (
  name: string,
  stateId: number,
): Promise<City | null> => {
  logger.info("entering::getCityByCityNameFromDb::repository");
  return db.city.findFirst({
    where: { name, isActive: true, stateId: stateId },
  });
};

export const updateCityInDb = async (city: UpdateCityInput): Promise<City> => {
  logger.info("entering::createCity::repository");
  const store = requestStorage.getStore();
  const omitted = customOmit<UpdateCityInput, "id">(city, ["id"]);
  return db.city.update({
    where: { id: city.id },
    data: { ...omitted.rest, updatedBy: store?.user?.id ?? null },
  });
};

export const deleteCityInDb = async (id: number): Promise<City> => {
  logger.info("entering::createCity::repository");
  const store = requestStorage.getStore();
  return db.city.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: store?.user?.id ?? null,
      deletedAt: new Date(),
    },
  });
};

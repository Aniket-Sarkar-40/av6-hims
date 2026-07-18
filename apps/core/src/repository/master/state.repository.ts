import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import { CreateStateInput, UpdateStateInput } from "@/types/master/state.js";
import { logger } from "@repo/platform/logging/logger.js";
import { State } from "@repo/db/generated/prisma/client";
import { omitUndefined } from "@repo/shared/utils/helper.utils.js";
import { customOmit } from "av6-utils";

export const createStateInDb = async (
  state: CreateStateInput,
): Promise<State> => {
  logger.info("entering::createState::repository");
  const store = requestStorage.getStore();
  return db.state.create({
    data: omitUndefined({ ...state, createdBy: store?.user?.id }),
  });
};

export const getAllstateFromDb = async (): Promise<State[]> => {
  logger.info("entering::getAllStates::repository");
  return db.state.findMany({
    where: { isActive: true },
  });
};

export const getStateByIdFromDb = async (id: number): Promise<State | null> => {
  logger.info("entering::getStateById::repository");
  return db.state.findUnique({
    where: { id, isActive: true },
  });
};

export const getStateByNameFromDb = async (
  name: string,
  countryId: number,
): Promise<State | null> => {
  logger.info("entering::getStateByNameFromDb::repository");
  return db.state.findFirst({
    where: {
      name,
      countryId,
      isActive: true,
    },
  });
};

export const updateStateInDb = async (
  state: UpdateStateInput,
): Promise<State> => {
  logger.info("entering::updateState::repository");
  const store = requestStorage.getStore();
  const omitted = customOmit<UpdateStateInput, "id">(state, ["id"]);
  return db.state.update({
    where: { id: state.id },
    data: omitUndefined({
      ...omitted.rest,
      updatedBy: store?.user?.id ?? null,
    }),
  });
};

export const deleteStateInDb = async (id: number): Promise<State> => {
  logger.info("entering::deleteState::repository");
  const store = requestStorage.getStore();
  return db.state.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: store?.user?.id ?? null,
    },
  });
};

export const getStateWithIncludesFromDB = async (id: number) => {
  logger.info("entering::createCity::repository");

  return db.state.findUnique({
    where: {
      id,
      isActive: true,
    },
  });
};

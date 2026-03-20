import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db/client";
import {
  CreateProcedureMasterInput,
  UpdateProcedureMasterInput,
} from "@/types/master/procedure.js";
import { customOmit } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import { ProcedureMaster } from "@repo/db/generated/prisma/client";

export const createProcedureInDb = async (
  input: CreateProcedureMasterInput,
): Promise<ProcedureMaster> => {
  logger.info("entering::createProcedureInDb::repository");
  const store = requestStorage.getStore();
  return db.procedureMaster.create({
    data: {
      ...input,
      createdBy: store?.user?.id,
    },
  });
};

export const updateProcedureInDb = async (
  input: UpdateProcedureMasterInput,
): Promise<ProcedureMaster> => {
  logger.info("entering::updateProcedureInDb::repository");
  const store = requestStorage.getStore();
  const omittedInput = customOmit<UpdateProcedureMasterInput, "id">(input, [
    "id",
  ]);
  return db.procedureMaster.update({
    where: {
      id: input.id,
    },
    data: {
      ...omittedInput.rest,
      updatedBy: store?.user?.id,
    },
  });
};

export const getProcedureByIdFromDb = async (
  id: number,
): Promise<ProcedureMaster | null> => {
  logger.info("entering::getProcedureByIdFromDb::repository");
  return db.procedureMaster.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getProcedureByNameFromDb = async (
  procedureName: string,
): Promise<ProcedureMaster | null> => {
  logger.info("entering::getProcedureByNameFromDb::repository");
  return db.procedureMaster.findFirst({
    where: {
      procedureName,
      isActive: true,
    },
  });
};

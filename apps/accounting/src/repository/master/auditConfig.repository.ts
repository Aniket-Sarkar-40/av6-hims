import { requestStorage } from "@/config/requestContext.js";
import { CreateOrUpdateAuditConfig } from "@/types/master/auditConfig.js";
import { db } from "@repo/db";
import { AccAuditConfig } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export async function CreateOrUpdateAuditConfigInDb(
  input: CreateOrUpdateAuditConfig
): Promise<AccAuditConfig> {
  logger.info("entering::CreateOrUpdateAuditConfigInDb::repository");
  const store = requestStorage.getStore();
  const createdBy = store?.user?.id;
  const omittedInput = customOmit<CreateOrUpdateAuditConfig, "id">(input, [
    "id",
  ]);

  return await db.auditConfig.create({
    data: {
      ...omittedInput.rest,
      createdBy,
    },
  });
}

export async function updateAuditConfigInDb(
  input: CreateOrUpdateAuditConfig
): Promise<AccAuditConfig> {
  logger.info("entering::updateAuditConfigInDb::repository");
  const store = requestStorage.getStore();
  const updatedBy = store?.user?.id;
  const omittedInput = customOmit<CreateOrUpdateAuditConfig, "id">(input, [
    "id",
  ]);
  return await db.auditConfig.update({
    where: { id: input.id },
    data: {
      ...omittedInput.rest,
      updatedBy,
    },
  });
}

export const getAuditConfigByIdFromDb = async (
  id: number
): Promise<AccAuditConfig | null> => {
  logger.info("entering::getAuditConfigByIdFromDb::repository");
  return db.auditConfig.findFirst({
    where: { id, isActive: true },
  });
};

export const getAllAuditConfigFromDb = async (): Promise<AccAuditConfig[]> => {
  logger.info("entering::getAllAuditConfigFromDb::repository");
  return db.auditConfig.findMany({
    where: { isActive: true },
  });
};

export const checkAuditConfigFieldDuplicate = async (
  input: CreateOrUpdateAuditConfig
) => {
  logger.info("entering::checkAuditConfigFieldDuplicate::repository");

  const fields = ["module", "service", "method"] as const;
  const andConditions = fields.map((f) => ({ [f]: input[f] }));

  const duplicate = await db.auditConfig.findFirst({
    where: {
      isActive: true,
      AND: andConditions,
    },
  });

  if (!duplicate) return null;

  const duplicateFields = fields.filter(
    (f) => input[f] && duplicate[f] === input[f]
  );

  return { auditConfig: duplicate, duplicateFields };
};

import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";
import {
  CreateAutoAlertAuditInput,
  CreateAutoAlertEmailInput,
  UpdateAutoAlertAuditInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";
import { logger } from "@repo/platform/logging/logger.js";
import {
  ALERT_TYPE,
  PmsAutoAlertAudit,
  PmsAutoAlertEmail,
} from "@repo/db/generated/prisma/client";

export const createAutoAlertEmailInDb = async (
  input: CreateAutoAlertEmailInput,
): Promise<PmsAutoAlertEmail> => {
  logger.info("entering::createAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.pmsAutoAlertEmail.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertEmailInDb = async (
  input: UpdateAutoAlertEmailInput,
): Promise<PmsAutoAlertEmail> => {
  logger.info("entering::updateAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.pmsAutoAlertEmail.update({
    where: {
      id,
    },
    data: {
      ...rest,
      updatedBy: currentUser,
    },
  });
};

export const getAutoAlertEmailByIdFromDb = async (
  id: number,
): Promise<PmsAutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.pmsAutoAlertEmail.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getAutoAlertEmailByShortCodeFromDb = async (
  shortCode: ALERT_TYPE,
): Promise<PmsAutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.pmsAutoAlertEmail.findFirst({
    where: {
      shortCode,
      isActive: true,
    },
  });
};

export const createAutoAlertAuditInDb = async (
  input: CreateAutoAlertAuditInput,
): Promise<PmsAutoAlertAudit> => {
  logger.info("entering::createAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.pmsAutoAlertAudit.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertAuditInDb = async (
  input: UpdateAutoAlertAuditInput,
): Promise<PmsAutoAlertAudit> => {
  logger.info("entering::updateAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.pmsAutoAlertAudit.update({
    where: {
      id,
    },
    data: {
      ...rest,
      updatedBy: currentUser,
    },
  });
};

export const getAutoAlertAuditByIdFromDb = async (
  id: number,
): Promise<PmsAutoAlertAudit | null> => {
  logger.info("entering::getAutoAlertAuditByIdFromDb::repository");
  return db.pmsAutoAlertAudit.findFirst({
    where: {
      id,
    },
  });
};

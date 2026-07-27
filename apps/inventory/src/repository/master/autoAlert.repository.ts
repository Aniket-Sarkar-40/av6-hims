import {
  CreateAutoAlertAuditInput,
  CreateAutoAlertEmailInput,
  UpdateAutoAlertAuditInput,
  UpdateAutoAlertEmailInput,
} from "@/types/master/autoAlert.js";
import { db } from "@repo/db/client";
import {
  INV_ALERT_TYPE,
  InvAutoAlertAudit,
  InvAutoAlertEmail,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";

export const createAutoAlertEmailInDb = async (
  input: CreateAutoAlertEmailInput,
): Promise<InvAutoAlertEmail> => {
  logger.info("entering::createAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.invAutoAlertEmail.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertEmailInDb = async (
  input: UpdateAutoAlertEmailInput,
): Promise<InvAutoAlertEmail> => {
  logger.info("entering::updateAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.invAutoAlertEmail.update({
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
): Promise<InvAutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.invAutoAlertEmail.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getAutoAlertEmailByShortCodeFromDb = async (
  shortCode: INV_ALERT_TYPE,
): Promise<InvAutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.invAutoAlertEmail.findFirst({
    where: {
      shortCode,
      isActive: true,
    },
  });
};

export const createAutoAlertAuditInDb = async (
  input: CreateAutoAlertAuditInput,
): Promise<InvAutoAlertAudit> => {
  logger.info("entering::createAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.invAutoAlertAudit.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertAuditInDb = async (
  input: UpdateAutoAlertAuditInput,
): Promise<InvAutoAlertAudit> => {
  logger.info("entering::updateAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.invAutoAlertAudit.update({
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
): Promise<InvAutoAlertAudit | null> => {
  logger.info("entering::getAutoAlertAuditByIdFromDb::repository");
  return db.invAutoAlertAudit.findFirst({
    where: {
      id,
    },
  });
};

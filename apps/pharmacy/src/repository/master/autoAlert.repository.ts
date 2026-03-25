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
  AutoAlertAudit,
  AutoAlertEmail,
} from "@repo/db/generated/prisma/client";

export const createAutoAlertEmailInDb = async (
  input: CreateAutoAlertEmailInput,
): Promise<AutoAlertEmail> => {
  logger.info("entering::createAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.autoAlertEmail.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertEmailInDb = async (
  input: UpdateAutoAlertEmailInput,
): Promise<AutoAlertEmail> => {
  logger.info("entering::updateAutoAlertEmailInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.autoAlertEmail.update({
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
): Promise<AutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.autoAlertEmail.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getAutoAlertEmailByShortCodeFromDb = async (
  shortCode: ALERT_TYPE,
): Promise<AutoAlertEmail | null> => {
  logger.info("entering::getAutoAlertEmailByIdFromDb::repository");
  return db.autoAlertEmail.findFirst({
    where: {
      shortCode,
      isActive: true,
    },
  });
};

export const createAutoAlertAuditInDb = async (
  input: CreateAutoAlertAuditInput,
): Promise<AutoAlertAudit> => {
  logger.info("entering::createAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.autoAlertAudit.create({
    data: {
      ...input,
      createdBy: currentUser,
    },
  });
};

export const updateAutoAlertAuditInDb = async (
  input: UpdateAutoAlertAuditInput,
): Promise<AutoAlertAudit> => {
  logger.info("entering::updateAutoAlertAuditInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const { id, ...rest } = input;
  return db.autoAlertAudit.update({
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
): Promise<AutoAlertAudit | null> => {
  logger.info("entering::getAutoAlertAuditByIdFromDb::repository");
  return db.autoAlertAudit.findFirst({
    where: {
      id,
    },
  });
};

import { requestStorage } from "@repo/platform/config/requestContext.js";
import { db } from "@repo/db";

import { uinServiceFactory } from "@/config/core.config.js";
import {
  CreateOrUpdateGatePassInput,
  GatePassFilter,
} from "@/types/gatePass/gatePass.js";
import { applyRound } from "av6-utils";
import { logger } from "@repo/platform/logging/logger.js";
import {
  PmsGatePass,
  PmsUinShortCode,
  Prisma,
  RoundFormat,
} from "@repo/db/generated/prisma/client";
import { settingsService } from "@/services/master/settings.service.js";

export const createGatePassInDb = async (
  input: CreateOrUpdateGatePassInput,
): Promise<PmsGatePass> => {
  logger.info("entering::createGatePassInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const generatedUin = await uinServiceFactory.generateUIN(
    PmsUinShortCode.GATE_PASS,
  );
  const setting = await settingsService.getSettings();
  const precision = setting?.defaultPrecision ?? 2;
  return db.pmsGatePass.create({
    data: {
      ...input,
      gatePassNumber: generatedUin,
      billAmount: applyRound(input.billAmount, RoundFormat.TO_FIXED, precision),
      createdBy: currentUser,
    },
  });
};

export const updateGatePassInDb = async (
  input: CreateOrUpdateGatePassInput,
): Promise<PmsGatePass> => {
  logger.info("entering::updateGatePassInDb::repository");

  const { id, ...gatePassData } = input;
  if (!id) {
    throw new Error("Cannot update a GatePass without an id");
  }

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const setting = store?.settings;
  const precision = setting?.defaultPrecision ?? 2;
  const updated = await db.pmsGatePass.update({
    where: { id },
    data: {
      ...gatePassData,
      billAmount: applyRound(input.billAmount, RoundFormat.TO_FIXED, precision),
      updatedBy: currentUser,
    },
  });

  logger.info(
    `updated GatePass id=${updated.id} gatePassNumber=${updated.gatePassNumber}`,
  );
  return updated;
};

export const getAllGatePassFromDb = async (): Promise<PmsGatePass[]> => {
  logger.info("entering::getAllGatePassFromDb::repository");

  const allGatePass = await db.pmsGatePass.findMany({
    where: { isActive: true },
  });

  logger.info("exiting::getAllGatePassFromDb::repository");
  return allGatePass;
};

export const findGatePassByInvoiceNumber = async (
  invoiceNumber: string,
): Promise<PmsGatePass | null> => {
  return db.pmsGatePass.findFirst({
    where: { invoiceNumber: invoiceNumber, isActive: true },
  });
};

export const getGatePassByIdFromDb = async (
  id: number,
): Promise<PmsGatePass | null> => {
  logger.info(`entering::getGatePassByIdFromDb::repository id=${id}`);

  const gatePass = await db.pmsGatePass.findFirst({
    where: { id, isActive: true },
  });

  logger.info(`exiting::getGatePassByIdFromDb::repository id=${id}`);
  return gatePass;
};

export const deleteGatePassFromDb = async (id: number) => {
  logger.info(`entering::deleteGatePassFromDb::repository id=${id}`);

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  await db.pmsGatePass.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
    },
  });

  logger.info(
    `exiting::deleteGatePassFromDb::repository id=${id} (deletedBy=${currentUser})`,
  );
};

export const getGatePassByFilterFromDb = async (
  filter: GatePassFilter,
): Promise<PmsGatePass[]> => {
  const where: Prisma.PmsGatePassWhereInput = { isActive: true };

  if (filter.poNumber) {
    where.poNumber = filter.poNumber;
  }

  if (filter.poDateStart || filter.poDateEnd) {
    let start: Date | undefined;
    let end: Date | undefined;

    if (filter.poDateStart) {
      start = new Date(filter.poDateStart);
    }
    if (filter.poDateEnd) {
      end = new Date(filter.poDateEnd);
    }
    if (filter.status) {
      where.status = filter.status;
    }

    where.poDate = {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    };
  }

  return db.pmsGatePass.findMany({
    where,
    orderBy: { poDate: "desc" },
  });
};

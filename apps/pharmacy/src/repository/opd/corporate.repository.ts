import { db } from "@repo/db";
import { logger } from "@repo/platform/logging/logger.js";
import {
  ClientMaster,
  PaymentTypePharmacy,
  PharmacyClientPaymentSettings,
} from "@repo/db/generated/prisma/client";

export const getCorporateClientPaymentSettings = async (
  clientId: number,
  ccId: number,
  medId: number,
): Promise<PharmacyClientPaymentSettings | null> => {
  logger.info("entering::getCorporateClientPaymentSettings::repository");
  return db.pharmacyClientPaymentSettings.findFirst({
    where: {
      clientId,
      medId,
      ccId,
      status: true,
      type: PaymentTypePharmacy.Pharmacy,
    },
  });
};

export const getCorporateClientById = async (
  id: number,
): Promise<ClientMaster | null> => {
  logger.info("entering::getCorporateClientById::repository");
  return db.clientMaster.findUnique({
    where: {
      id,
      status: "active",
    },
  });
};

export const getCorporateClientByCcId = async (
  ccId: number,
): Promise<ClientMaster[]> => {
  logger.info("entering::getCorporateClientByCcId::repository");
  return db.clientMaster.findMany({
    where: {
      ccId,
      status: "active",
    },
  });
};

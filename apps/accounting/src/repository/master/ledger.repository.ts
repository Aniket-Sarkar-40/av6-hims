import { requestStorage } from "@/config/requestContext.js";
import { CreateOrUpdateLedgerInput } from "@/types/master/ledger.js";
import { db } from "@repo/db";
import { Ledger } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createLedgerInDb = async (input: CreateOrUpdateLedgerInput) => {
  logger.info("entering::createLedgerInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { ledgerOpeningBalance, ...ledgerData } = input;
  return db.$transaction(async (tx) => {
    return await tx.ledger.create({
      data: {
        ...ledgerData,
        createdBy: currentUser,
        ledgerOpeningBalances: ledgerOpeningBalance
          ? {
              create: {
                ...ledgerOpeningBalance,
                asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                companyId: ledgerData.companyId,
                createdBy: currentUser,
              },
            }
          : undefined,
      },
    });
  });
};

export const updateLedgerInDb = async (input: CreateOrUpdateLedgerInput) => {
  logger.info("entering::updateLedgerInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const { ledgerOpeningBalance, id, ...ledgerData } = input;

  return db.$transaction(async (tx) => {
    return await tx.ledger.update({
      where: { id },
      data: {
        ...ledgerData,
        updatedBy: currentUser,
        ledgerOpeningBalances: ledgerOpeningBalance
          ? ledgerOpeningBalance.id
            ? {
                update: {
                  where: { id: ledgerOpeningBalance.id },
                  data: {
                    ...customOmit(ledgerOpeningBalance, ["id"]).rest,
                    asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                    companyId: ledgerData.companyId,
                    updatedBy: currentUser,
                  },
                },
              }
            : {
                create: {
                  ...ledgerOpeningBalance,
                  asOnDate: new Date(ledgerOpeningBalance.asOnDate),
                  companyId: ledgerData.companyId,
                  createdBy: currentUser,
                },
              }
          : undefined,
      },
    });
  });
};

export const deleteLedgerFromDb = async (id: number) => {
  logger.info("entering::deleteLedgerFromDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.ledger.update({
    where: { id },
    data: {
      isActive: false,
      deletedBy: currentUser,
      deletedAt: new Date(),
      ledgerOpeningBalances: {
        updateMany: {
          where: {
            ledgerId: id,
          },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        },
      },
    },
  });
};

export const getLedgersByCompanyIdAndLedgerIds = async (params: {
  companyId: number;
  ledgerIds?: number[];
}): Promise<Ledger[]> => {
  logger.info("entering::getLedgersByCompanyIdAndLedgerIds::repository");
  const { companyId, ledgerIds } = params;

  return await db.ledger.findMany({
    where: {
      companyId,
      isActive: true,
      ...(ledgerIds?.length ? { id: { in: ledgerIds } } : {}),
    },
  });
};

export const getAllLedgersByCompanyId = async (
  companyId: number
): Promise<Ledger[]> => {
  logger.info("entering::getAllLedgersByCompanyId::repository");
  return await db.ledger.findMany({
    where: {
      companyId,
      isActive: true,
    },
  });
};

export const getLedgersByGroupId = async (
  groupId: number
): Promise<Ledger[]> => {
  logger.info("entering::getLedgersByGroupId::repository");
  return await db.ledger.findMany({
    where: {
      groupId,
      isActive: true,
    },
  });
};

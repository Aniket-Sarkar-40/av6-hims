import { requestStorage } from "@/config/requestContext.js";
import { CreateOrUpdateCompanyFinancialYear } from "@/types/master/companyFinancialYear.js";
import { db } from "@repo/db";
import { CompanyFinancialYear } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";

export const createCompanyFinancialYearInDb = async (
  input: CreateOrUpdateCompanyFinancialYear,
) => {
  logger.info("entering::createCompanyFinancialYearInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return db.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.companyFinancialYear.updateMany({
        where: { companyId: input.companyId, isCurrent: true },
        data: {
          isCurrent: false,
          updatedBy: currentUser,
        },
      });
    }
    return await tx.companyFinancialYear.create({
      data: {
        ...input,
        createdBy: currentUser,
      },
    });
  });
};

export const updateCompanyFinancialYearInDb = async (
  input: CreateOrUpdateCompanyFinancialYear,
) => {
  logger.info("entering::updateCompanyFinancialYearInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  return db.$transaction(async (tx) => {
    if (input.isCurrent) {
      await tx.companyFinancialYear.updateMany({
        where: {
          companyId: input.companyId,
          isCurrent: true,
          NOT: { id: input.id },
        },
        data: {
          isCurrent: false,
          updatedBy: currentUser,
        },
      });
    }
    return await tx.companyFinancialYear.update({
      where: { id: input.id },
      data: {
        ...input,
        updatedBy: currentUser,
      },
    });
  });
};

export const getAllCompanyFinancialYearsByCompanyIdFromDb = async (
  companyId: number,
): Promise<CompanyFinancialYear[]> => {
  logger.info(
    "entering::getAllCompanyFinancialYearsByCompanyIdFromDb::repository",
  );
  return await db.companyFinancialYear.findMany({
    where: { companyId, isActive: true },
    orderBy: { id: "desc" },
  });
};

export const getCompanyFinancialYearByIdFromDb = async (
  id: number,
): Promise<CompanyFinancialYear | null> => {
  logger.info("entering::getCompanyFinancialYearByIdFromDb::repository");
  return await db.companyFinancialYear.findFirst({
    where: { id, isActive: true },
  });
};

export const getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb = async (
  companyId: number,
): Promise<CompanyFinancialYear | null> => {
  logger.info(
    "entering::getCompanyFinancialYearByCompanyIdAndIsCurrentFromDb::repository",
  );
  return await db.companyFinancialYear.findFirst({
    where: { companyId, isCurrent: true, isActive: true },
  });
};

export const closeCompanyFinancialYearInDb = async (id: number) => {
  logger.info("entering::closeCompanyFinancialYearInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.companyFinancialYear.update({
    where: { id, isActive: true },
    data: {
      isClosed: true,
      closedAt: new Date(),
      closedBy: currentUser,
    },
  });
};

export const toggleLockCompanyFinancialYearInDb = async (params: {
  id: number;
  status: boolean;
}) => {
  logger.info("entering::toggleLockCompanyFinancialYearInDb::repository");
  const { id, status } = params;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  return await db.companyFinancialYear.update({
    where: { id, isActive: true },
    data: { isLocked: status, updatedBy: currentUser },
  });
};

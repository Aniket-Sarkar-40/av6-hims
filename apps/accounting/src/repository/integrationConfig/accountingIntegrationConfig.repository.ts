import { requestStorage } from "@/config/requestContext.js";
import {
  AccountingIntegrationConfigResponse,
  CreateOrUpdateAccountingIntegrationConfigInput,
} from "@/types/integrationConfig/accountingIntegrationConfig.js";
import { db } from "@repo/db";
import { AccountingIntegrationConfigDetails } from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createAccountingIntegrationConfigInDb = async (
  input: CreateOrUpdateAccountingIntegrationConfigInput,
): Promise<AccountingIntegrationConfigResponse> => {
  logger.info("entering::createAccountingIntegrationConfigInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedInput = customOmit<
    CreateOrUpdateAccountingIntegrationConfigInput,
    "id" | "accountingIntegrationConfigDetails" | "existing"
  >(input, ["id", "accountingIntegrationConfigDetails", "existing"]);
  return await db.accountingIntegrationConfig.create({
    data: {
      ...omittedInput.rest,
      createdBy: currentUser,
      accountingIntegrationConfigDetails: {
        create: input.accountingIntegrationConfigDetails.map((detail) => ({
          ...detail,
          createdBy: currentUser,
        })),
      },
    },
    include: {
      accountingIntegrationConfigDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const updateAccountingIntegrationConfigInDb = async (
  input: CreateOrUpdateAccountingIntegrationConfigInput,
): Promise<AccountingIntegrationConfigResponse> => {
  logger.info("entering::updateAccountingIntegrationConfigInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedInput = customOmit<
    CreateOrUpdateAccountingIntegrationConfigInput,
    "id" | "accountingIntegrationConfigDetails" | "existing"
  >(input, ["id", "accountingIntegrationConfigDetails", "existing"]);

  const { accountingIntegrationConfigDetails, existing } = omittedInput.omitted;

  const accountingIntegrationConfigDetailsToCreate =
    accountingIntegrationConfigDetails.filter((detail) => !detail.id);
  const accountingIntegrationConfigDetailsToUpdate =
    accountingIntegrationConfigDetails.filter((detail) => detail.id);

  const accountingIntegrationConfigDetailsToDelete =
    existing.accountingIntegrationConfigDetails
      .filter(
        (detail) =>
          !accountingIntegrationConfigDetails.some((d) => d.id === detail.id),
      )
      .map((detail) => detail.id);

  return await db.accountingIntegrationConfig.update({
    where: {
      id: input.id,
    },
    data: {
      ...omittedInput.rest,
      updatedBy: currentUser,
      accountingIntegrationConfigDetails: {
        create: accountingIntegrationConfigDetailsToCreate.map((detail) => ({
          ...detail,
          createdBy: currentUser,
        })),
        update: accountingIntegrationConfigDetailsToUpdate.map((detail) => ({
          where: { id: detail.id },
          data: {
            ...customOmit(detail, ["id"]).rest,
            updatedBy: currentUser,
          },
        })),
        updateMany: accountingIntegrationConfigDetailsToDelete.map((id) => ({
          where: { id },
          data: {
            isActive: false,
            deletedBy: currentUser,
            deletedAt: new Date(),
          },
        })),
      },
    },
    include: {
      accountingIntegrationConfigDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getAccountingIntegrationConfigFromDb = async (
  id: number,
): Promise<AccountingIntegrationConfigResponse | null> => {
  logger.info("entering::getAccountingIntegrationConfigFromDb::repository");
  return await db.accountingIntegrationConfig.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      accountingIntegrationConfigDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
};

export const getAccountingIntegrationConfigDetailsFromDb = async (
  id: number,
): Promise<AccountingIntegrationConfigDetails | null> => {
  logger.info(
    "entering::getAccountingIntegrationConfigDetailsFromDb::repository",
  );
  return await db.accountingIntegrationConfigDetails.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

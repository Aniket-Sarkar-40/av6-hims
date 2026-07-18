import { requestStorage } from "@/config/requestContext.js";
import {
  CompanyAddressCreateInput,
  CompanyFeaturesCreateInput,
  CompanyFinancialYearCreateInput,
  CompanyResponse,
  CompanyStatutoryCreateInput,
  CreateOrUpdateCompanyInput,
} from "@/types/company/company.js";
import { db } from "@repo/db/client";
import {
  Company,
  CompanyFinancialYear,
} from "@repo/db/generated/prisma/client";
import { logger } from "@repo/platform/logging/logger.js";
import { customOmit } from "av6-utils";

export const createCompanyInDb = async (input: CreateOrUpdateCompanyInput) => {
  logger.info("entering::createCompanyInDb::repository");

  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omittedData = customOmit<
    CreateOrUpdateCompanyInput,
    | "id"
    | "addresses"
    | "statutory"
    | "financialYears"
    | "features"
    | "existing"
  >(input, [
    "id",
    "addresses",
    "statutory",
    "financialYears",
    "features",
    "existing",
  ]);

  const { addresses, statutory, financialYears, features } =
    omittedData.omitted;
  return await db.$transaction(async (tx) => {
    await tx.company.create({
      data: {
        ...omittedData.rest,
        createdBy: currentUser,
        companyAddresses: {
          createMany: {
            data: addresses.map((address) => ({
              ...address,
              createdBy: currentUser,
            })),
          },
        },
        companyStatutory: {
          create: {
            ...statutory,
            gstEffectiveFrom: statutory.gstEffectiveFrom
              ? new Date(statutory.gstEffectiveFrom)
              : null,
            createdBy: currentUser,
          },
        },
        companyFinancialYears: {
          create: {
            ...financialYears,
            createdBy: currentUser,
          },
        },
        companyFeatures: {
          create: {
            ...features,
            createdBy: currentUser,
          },
        },
      },
    });
  });
};

export const updateCompanyInDb = async (input: CreateOrUpdateCompanyInput) => {
  logger.info("entering::updateCompanyInDb::repository");
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;

  const omittedData = customOmit<
    CreateOrUpdateCompanyInput,
    | "id"
    | "addresses"
    | "statutory"
    | "financialYears"
    | "features"
    | "existing"
  >(input, [
    "id",
    "addresses",
    "statutory",
    "financialYears",
    "features",
    "existing",
  ]);

  const { addresses, statutory, financialYears, features, existing } =
    omittedData.omitted;
  const incomingIdSet = new Set(addresses.filter((a) => a.id).map((a) => a.id));

  const addressToDelete = existing.companyAddresses
    .map((a) => a.id)
    .filter((id) => !incomingIdSet.has(id));
  const addressToCreate = addresses.filter((add) => !add.id);
  const addressToUpdate = addresses.filter((add) => add.id);

  return await db.$transaction(async (tx) => {
    await tx.company.update({
      where: {
        id: input.id,
      },
      data: {
        ...omittedData.rest,
        updatedBy: currentUser,
        companyAddresses: {
          updateMany: {
            where: {
              id: {
                in: addressToDelete,
              },
            },
            data: {
              isActive: false,
              deletedBy: currentUser,
              deletedAt: new Date(),
            },
          },
          createMany: {
            data: addressToCreate.map((address) => ({
              ...address,
              createdBy: currentUser,
            })),
          },
          update: addressToUpdate.map((address) => ({
            where: {
              id: address.id,
            },
            data: {
              ...customOmit<CompanyAddressCreateInput, "id">(address, ["id"])
                .rest,
              updatedBy: currentUser,
            },
          })),
        },
        companyStatutory: {
          update: {
            where: {
              id: statutory.id,
            },
            data: {
              ...customOmit<CompanyStatutoryCreateInput, "id">(statutory, [
                "id",
              ]).rest,
              gstEffectiveFrom: statutory.gstEffectiveFrom
                ? new Date(statutory.gstEffectiveFrom)
                : null,
              updatedBy: currentUser,
            },
          },
        },
        companyFinancialYears: {
          update: {
            where: {
              id: financialYears.id,
            },
            data: {
              ...customOmit<CompanyFinancialYearCreateInput, "id">(
                financialYears,
                ["id"],
              ).rest,
              updatedBy: currentUser,
            },
          },
        },
        companyFeatures: {
          update: {
            where: {
              id: features.id,
            },
            data: {
              ...customOmit<CompanyFeaturesCreateInput, "id">(features, ["id"])
                .rest,
              updatedBy: currentUser,
            },
          },
        },
      },
    });
  });
};

export const getCompanyById = async (
  id: number,
): Promise<CompanyResponse | null> => {
  logger.info("entering::getCompanyById::repository");
  return db.company.findFirst({
    where: {
      id,
      isActive: true,
    },
    include: {
      companyAddresses: {
        where: {
          isActive: true,
        },
      },
      companyStatutory: true,
      companyFinancialYears: {
        where: {
          isActive: true,
        },
      },
      companyFeatures: true,
    },
  });
};

export const getCompanyByCode = async (
  code: string,
  companyId?: number,
): Promise<Company | null> => {
  logger.info("entering::getCompanyByCode::repository");
  return db.company.findFirst({
    where: {
      id: { not: companyId },
      code,
      isActive: true,
    },
  });
};

export const getCompanyFYByCompanyAndDateRange = async (
  companyId: number,
  startDate: Date,
  endDate: Date,
): Promise<CompanyFinancialYear | null> => {
  logger.info("entering::getCompanyFYByCompanyAndDateRange::repository");
  return db.companyFinancialYear.findFirst({
    where: {
      companyId: { not: companyId },
      isActive: true,
      startDate: {
        lte: endDate,
      },
      endDate: {
        gte: startDate,
      },
    },
  });
};

export const getCompanyFYByCompanyIdAndFyIdFromDb = async (
  companyId: number,
  fyId: number,
): Promise<CompanyFinancialYear | null> => {
  logger.info("entering::getCompanyFYByCompanyIdAndFyIdFromDb::repository");
  return db.companyFinancialYear.findFirst({
    where: {
      id: fyId,
      companyId: companyId,
      isActive: true,
    },
  });
};

export const getFyByIdFromDb = async (
  id: number,
): Promise<CompanyFinancialYear | null> => {
  logger.info("entering::getFyByIdFromDb::repository");
  return db.companyFinancialYear.findFirst({
    where: {
      id,
      isActive: true,
    },
  });
};

export const getCompanyByIdFromDb = async (
  id: number,
): Promise<Company | null> => {
  logger.info("entering::getCompanyByIdFromDb::repository");
  return db.company.findFirst({
    where: { id, isActive: true },
  });
};

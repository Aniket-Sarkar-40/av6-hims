import { uinServiceFactory } from "@/config/core.config.js";
import {
  ItemSupplierCreateInput,
  ItemSupplierResponse,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier.js";
import { db } from "@repo/db/client";
import {
  InvItemSupplier,
  InvUinShortCode,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { customOmit } from "av6-utils";

export async function createItemSupplierInDb(
  data: ItemSupplierCreateInput
): Promise<ItemSupplierResponse> {
  logger.info("entering::createItemSupplierInDb::repository");
  const store = requestStorage.getStore();
  const supplierCode = await uinServiceFactory.generateUIN(
    InvUinShortCode.VENDOR
  );
  return await db.$transaction(
    async (tx) => {
      const itemSupplier = await tx.invItemSupplier.create({
        data: {
          ...data,
          supplierCode: supplierCode ?? data.supplierCode,
          createdBy: store?.user?.id,
          taxIdentificationDetails: data.taxIdentificationDetails
            ? {
                create: data.taxIdentificationDetails.map((tid) => ({
                  taxIdentificationName: tid.taxIdentificationName,
                  taxIdentificationValue: tid.taxIdentificationValue,
                  taxIdentificationNumber: tid.taxIdentificationNumber,
                  createdBy: store?.user?.id,
                })),
              }
            : undefined,
          bankDetails: data.bankDetails
            ? {
                create: data.bankDetails.map((bd) => ({
                  accountNo: bd.accountNo,
                  accountHolderName: bd.accountHolderName ?? undefined,
                  typeOfAccount: bd.typeOfAccount ?? undefined,
                  ifscCode: bd.ifscCode,
                  bankName: bd.bankName,
                  bankAddress: bd.bankAddress ?? undefined,
                  createdBy: store?.user?.id,
                })),
              }
            : undefined,
        },
        include: {
          taxIdentificationDetails: true,
          bankDetails: true,
        },
      });
      logger.info("exiting::createItemSupplierInDb::repository");
      return itemSupplier;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
}

export async function updateItemSupplierInDb(
  data: ItemSupplierUpdateInput
): Promise<ItemSupplierResponse> {
  logger.info("entering::updateItemSupplierInDb::repository");
  const store = requestStorage.getStore();
  const omitteditemSupplier = customOmit<
    ItemSupplierUpdateInput,
    | "taxIdentificationDetails"
    | "bankDetails"
    | "id"
    | "existingItemSupplier"
    | "supplierCode"
  >(data, ["taxIdentificationDetails", "bankDetails", "id", "supplierCode"]);
  const { taxIdentificationDetails, bankDetails, id, existingItemSupplier } =
    omitteditemSupplier.omitted;

  const toDeleteTid =
    existingItemSupplier?.taxIdentificationDetails
      ?.filter(
        (existingDetail) =>
          !taxIdentificationDetails?.some(
            (updatedDetail) => updatedDetail.id === existingDetail.id
          )
      )
      .map((detail) => detail.id) || [];

  const toDeleteBd =
    existingItemSupplier?.bankDetails
      ?.filter(
        (existingDetail) =>
          !bankDetails?.some(
            (updatedDetail) => updatedDetail.id === existingDetail.id
          )
      )
      .map((detail) => detail.id) || [];

  return await db.$transaction(
    async (tx) => {
      const itemSupplier = await tx.invItemSupplier.update({
        where: {
          id,
        },
        data: {
          ...omitteditemSupplier.rest,
          updatedBy: store?.user?.id,
          taxIdentificationDetails: taxIdentificationDetails
            ? {
                create: taxIdentificationDetails
                  .filter((d) => typeof d.id !== "number")
                  .map((d) => ({
                    taxIdentificationName: d.taxIdentificationName,
                    taxIdentificationValue: d.taxIdentificationValue,
                    taxIdentificationNumber: d.taxIdentificationNumber,
                    createdBy: store?.user?.id,
                  })),
                update: taxIdentificationDetails
                  .filter((d) => typeof d.id === "number")
                  .map((d) => ({
                    where: { id: d.id },
                    data: {
                      taxIdentificationName: d.taxIdentificationName,
                      taxIdentificationValue: d.taxIdentificationValue,
                      taxIdentificationNumber: d.taxIdentificationNumber,
                      updatedBy: store?.user?.id,
                    },
                  })),
                updateMany: toDeleteTid?.map((id) => ({
                  where: { id: id },
                  data: { isActive: false, deletedBy: store?.user?.id },
                })),
              }
            : undefined,
          bankDetails: bankDetails
            ? {
                create: bankDetails
                  .filter((d) => typeof d.id !== "number")
                  .map((bd) => ({
                    accountNo: bd.accountNo,
                    accountHolderName: bd.accountHolderName ?? undefined,
                    typeOfAccount: bd.typeOfAccount ?? undefined,
                    ifscCode: bd.ifscCode,
                    bankName: bd.bankName,
                    bankAddress: bd.bankAddress ?? undefined,
                    createdBy: store?.user?.id,
                  })),
                update: bankDetails
                  .filter((d) => typeof d.id === "number")
                  .map((bd) => ({
                    where: { id: bd.id },
                    data: {
                      accountNo: bd.accountNo,
                      accountHolderName: bd.accountHolderName ?? undefined,
                      typeOfAccount: bd.typeOfAccount ?? undefined,
                      ifscCode: bd.ifscCode,
                      bankName: bd.bankName,
                      bankAddress: bd.bankAddress ?? undefined,
                      updatedBy: store?.user?.id,
                    },
                  })),
                updateMany: toDeleteBd?.map((id) => ({
                  where: { id: id },
                  data: { isActive: false, deletedBy: store?.user?.id },
                })),
              }
            : undefined,
        },
        include: {
          taxIdentificationDetails: {
            where: {
              isActive: true,
            },
          },
          bankDetails: {
            where: {
              isActive: true,
            },
          },
        },
      });
      logger.info("exiting::updateItemSupplierInDb::repository");
      return itemSupplier;
    },
    {
      timeout: API_TIMEOUT,
    }
  );
}

export async function getAllItemSupplierFromDb(): Promise<
  ItemSupplierResponse[]
> {
  logger.info("entering::getAllItemSupplierFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findMany({
    where: {
      isActive: true,
    },

    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
      bankDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getAllItemSupplierFromDb::repository");
  return itemSupplier;
}

export async function getItemSupplierByIdFromDb(
  itemSupplierId: number
): Promise<ItemSupplierResponse | null> {
  logger.info("entering::getItemSupplierByIdFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      id: itemSupplierId,
      isActive: true,
    },
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
      bankDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getItemSupplierByIdFromDb::repository");
  return itemSupplier;
}

export async function deleteItemSupplierByIdFromDb(
  itemSupplierId: number
): Promise<void> {
  logger.info("entering::deleteItemSupplierByIdFromDb::repository");
  const store = requestStorage.getStore();
  const deletedAt = new Date();
  const deletedBy = store?.user?.id;

  await db.$transaction(async (tx) => {
    await tx.invItemSupplier.update({
      where: {
        id: itemSupplierId,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy,
        deletedAt,
      },
    });

    await tx.taxIdentificationDetails.updateMany({
      where: {
        itemSupplierId,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy,
        deletedAt,
      },
    });

    await tx.bankDetails.updateMany({
      where: {
        itemSupplierId,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy,
        deletedAt,
      },
    });

    await tx.invItemSupplierMapping.updateMany({
      where: {
        supplierId: itemSupplierId,
        isActive: true,
      },
      data: {
        isActive: false,
        deletedBy,
        deletedAt,
      },
    });

    logger.info("exiting::deleteItemSupplierByIdFromDb::repository");
  });
}

export async function getItemSupplierBySupplierCodeFromDb(
  supplierCode: string
): Promise<InvItemSupplier | null> {
  logger.info("entering::getItemSupplierBySupplierCodeFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      supplierCode,
      isActive: true,
    },
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
      bankDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getItemSupplierBySupplierCodeFromDb::repository");
  return itemSupplier;
}

export async function getItemSupplierByNameFromDb(
  name: string
): Promise<InvItemSupplier | null> {
  logger.info("entering::getItemSupplierByNameFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      name,
      isActive: true,
    },
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
      },
      bankDetails: {
        where: {
          isActive: true,
        },
      },
    },
  });
  logger.info("exiting::getItemSupplierByNameFromDb::repository");
  return itemSupplier;
}

export const getPhoneNumberFromDb = async (phoneNumber: string) => {
  logger.info("entering::getPhoneNumberFromDb::repository");
  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      phone: phoneNumber,
      isActive: true,
    },
  });
  logger.info("exiting::getPhoneNumberFromDb::repository");
  return itemSupplier;
};

export const getEmailFromDb = async (email: string) => {
  logger.info("entering::getEmailFromDb::repository");
  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      email: email,
      isActive: true,
    },
  });
  logger.info("exiting::getEmailFromDb::repository");
  return itemSupplier;
};

export const getFirstItemSupplierForExcelFromDb = async () => {
  logger.info("entering::getFirstItemSupplierForExcelFromDb::repository");
  return await db.invItemSupplier.findFirst({
    include: {
      taxIdentificationDetails: {
        where: {
          isActive: true,
        },
        orderBy: {
          id: "asc",
        },
        take: 1,
      },
      bankDetails: {
        where: {
          deletedAt: null,
          isActive: true,
        },
        orderBy: {
          id: "asc",
        },
        take: 1,
      },
      taxDetails: true,
    },
    orderBy: {
      id: "asc",
    },
  });
};

import { uinServiceFactory } from "@/config/core.config.js";
import { initializeCache } from "@/config/redisClient.js";
import { ItemSupplierSearchType } from "@/enums/itemSupplier.enums.js";
import { mapExcelRowToItemSupplierReq } from "@/mapper/master/itemSupplier.mapper.js";
import { createBatchJobInDb } from "@/repository/batch/batch.repository.js";
import { settingsService } from "@/services/master/settings.service.js";
import {
  ItemSupplierBatchJobInput,
  ItemSupplierCreateInput,
  ItemSupplierLookupRow,
  ItemSupplierResponse,
  ItemSupplierUpdateInput,
} from "@/types/master/itemSupplier.js";
import { ItemSupplierExcelStagingRow } from "@/validations/request/master/itemSupplierExcel.validation.js";
import { createItemSupplierServiceValidation } from "@/validations/service/master/itemSupplier.service.validation.js";
import { db } from "@repo/db/client";
import {
  InvItemSupplier,
  InvUinShortCode,
  Prisma,
} from "@repo/db/generated/prisma/client";
import { requestStorage } from "@repo/platform/config/requestContext.js";
import { logger } from "@repo/platform/logging/logger.js";
import { API_TIMEOUT } from "@repo/shared/config/index.js";
import { customOmit } from "av6-utils";

export async function createItemSupplierInDb(
  data: ItemSupplierCreateInput,
): Promise<ItemSupplierResponse> {
  logger.info("entering::createItemSupplierInDb::repository");
  //const settings = await settingsService.getSettings();
  //const isAccounting = settings?.isAccounting;
  const store = requestStorage.getStore();

  const omittedItemSupplier = customOmit<
    ItemSupplierCreateInput,
    "taxIdentificationDetails" | "bankDetails" | "ledgerId"
  >(data, ["taxIdentificationDetails", "bankDetails", "ledgerId"]);

  const supplierCode =
    omittedItemSupplier.rest.supplierCode?.trim() ||
    (await uinServiceFactory.generateUIN(InvUinShortCode.VENDOR));
  //const currentUser = store?.user?.id;

  return await db.$transaction(
    async (tx) => {
      const itemSupplier = await tx.invItemSupplier.create({
        data: {
          ...omittedItemSupplier.rest,
          supplierCode,
          createdBy: store?.user?.id,

          taxIdentificationDetails:
            omittedItemSupplier.omitted.taxIdentificationDetails &&
            omittedItemSupplier.omitted.taxIdentificationDetails.length > 0
              ? {
                  create:
                    omittedItemSupplier.omitted.taxIdentificationDetails.map(
                      (tid) => ({
                        taxIdentificationName: tid.taxIdentificationName,
                        taxIdentificationValue: tid.taxIdentificationValue,
                        taxIdentificationNumber: tid.taxIdentificationNumber,
                        createdBy: store?.user?.id,
                      }),
                    ),
                }
              : undefined,

          bankDetails:
            omittedItemSupplier.omitted.bankDetails &&
            omittedItemSupplier.omitted.bankDetails.length > 0
              ? {
                  create: omittedItemSupplier.omitted.bankDetails.map((bd) => ({
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

      // if (isAccounting && currentUser && data.ledgerId !== undefined) {
      //   const result =
      //     await accountingExternalService.createItemSupplierVoucher({
      //       clientId: itemSupplier.id,
      //       clientType: "INV_ITEM_SUPPLIER",
      //       mappingStatus: data.ledgerId ? "CREATED" : "CREATE",
      //       ledgerId: data.ledgerId ?? null,
      //       createdBy: currentUser,
      //     });
      //   if (!result.success) {
      //     throw new ErrorHandler(result.status, result.message);
      //   }
      // }

      logger.info("exiting::createItemSupplierInDb::repository");

      return itemSupplier;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
}

export async function updateItemSupplierInDb(
  data: ItemSupplierUpdateInput,
): Promise<ItemSupplierResponse> {
  logger.info("entering::updateItemSupplierInDb::repository");
  //const settings = await settingsService.getSettings();
  //const isAccounting = settings?.isAccounting;
  const store = requestStorage.getStore();
  const currentUser = store?.user?.id;
  const omitteditemSupplier = customOmit<
    ItemSupplierUpdateInput,
    | "taxIdentificationDetails"
    | "bankDetails"
    | "id"
    | "existingItemSupplier"
    | "ledgerId"
  >(data, ["taxIdentificationDetails", "bankDetails", "id", "ledgerId"]);
  const { taxIdentificationDetails, bankDetails, id, existingItemSupplier } =
    omitteditemSupplier.omitted;

  const toDeleteTid =
    existingItemSupplier?.taxIdentificationDetails
      ?.filter(
        (existingDetail) =>
          !taxIdentificationDetails?.some(
            (updatedDetail) => updatedDetail.id === existingDetail.id,
          ),
      )
      .map((detail) => detail.id) || [];

  const toDeleteBd =
    existingItemSupplier?.bankDetails
      ?.filter(
        (existingDetail) =>
          !bankDetails?.some(
            (updatedDetail) => updatedDetail.id === existingDetail.id,
          ),
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
          updatedBy: currentUser,
          taxIdentificationDetails: taxIdentificationDetails
            ? {
                create: taxIdentificationDetails
                  .filter((d) => typeof d.id !== "number")
                  .map((d) => ({
                    taxIdentificationName: d.taxIdentificationName,
                    taxIdentificationValue: d.taxIdentificationValue,
                    taxIdentificationNumber: d.taxIdentificationNumber,
                    createdBy: currentUser,
                  })),
                update: taxIdentificationDetails
                  .filter((d) => typeof d.id === "number")
                  .map((d) => ({
                    where: { id: d.id },
                    data: {
                      taxIdentificationName: d.taxIdentificationName,
                      taxIdentificationValue: d.taxIdentificationValue,
                      taxIdentificationNumber: d.taxIdentificationNumber,
                      updatedBy: currentUser,
                    },
                  })),
                updateMany: toDeleteTid?.map((id) => ({
                  where: { id },
                  data: {
                    isActive: false,
                    deletedBy: currentUser,
                  },
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
                    createdBy: currentUser,
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
                      updatedBy: currentUser,
                    },
                  })),
                updateMany: toDeleteBd?.map((id) => ({
                  where: { id },
                  data: {
                    isActive: false,
                    deletedBy: currentUser,
                  },
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
      // if (isAccounting && currentUser && data.ledgerId !== undefined) {
      //   const result =
      //     await accountingExternalService.createItemSupplierVoucher({
      //       clientId: itemSupplier.id,
      //       clientType: "INV_ITEM_SUPPLIER",
      //       mappingStatus: data.ledgerId ? "CREATED" : "CREATE",
      //       ledgerId: data.ledgerId ?? null,
      //       createdBy: currentUser,
      //     });
      //   if (!result.success) {
      //     throw new ErrorHandler(result.status, result.message);
      //   }
      // }
      logger.info("exiting::updateItemSupplierInDb::repository");
      return itemSupplier;
    },
    {
      timeout: API_TIMEOUT,
    },
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
  itemSupplierId: number,
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
  itemSupplierId: number,
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
  supplierCode: string,
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
  name: string,
): Promise<InvItemSupplier | null> {
  logger.info("entering::getItemSupplierByNameFromDb::repository");

  const itemSupplier = await db.invItemSupplier.findFirst({
    where: {
      vendorCompanyName: name,
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

export const createItemSupplierExcelInDb = async (
  inp: ItemSupplierExcelStagingRow[],
) => {
  logger.info("entering::createItemSupplierExcelInDb::repository");

  const batchJobNo = await uinServiceFactory.generateUIN(
    InvUinShortCode.BATCH_JOB,
  );

  return await db.$transaction(
    async (tx) => {
      const batchJob = await createBatchJobInDb(tx, {
        totalQty: inp.length,
        type: "ITEM_SUPPLIER",
        status: "PENDING",
        batchJobNo,
      });

      const rows: Prisma.InvItemSupplierExcelUncheckedCreateInput[] = inp.map(
        (record) => ({
          rowNo: record.rowNo,

          supplierCode: record.supplierCode?.trim() || null,
          vendorCompanyName: record.vendorCompanyName.trim(),
          phone: record.phone?.trim() || null,
          email: record.email?.trim() || null,
          billTo: record.billTo.trim(),
          shipTo: record.shipTo.trim(),
          vendorType: record.vendorType ?? null,

          salesPerson: record.salesPerson?.trim() || null,
          salesPersonPhone: record.salesPersonPhone?.trim() || null,
          salesPersonEmail: record.salesPersonEmail?.trim() || null,

          proprietaryPersonName: record.proprietaryPersonName?.trim() || null,
          proprietaryPersonPhone: record.proprietaryPersonPhone?.trim() || null,
          proprietaryPersonEmail: record.proprietaryPersonEmail?.trim() || null,

          termsAndCondition: record.termsAndCondition?.trim() || null,
          stockShipmentDetails: record.stockShipmentDetails?.trim() || null,

          accountNo: record.accountNo ?? null,
          accountHolderName: record.accountHolderName?.trim() || null,
          typeOfAccount: record.typeOfAccount?.trim() || null,
          ifscCode: record.ifscCode?.trim() || null,
          bankName: record.bankName?.trim() || null,
          bankAddress: record.bankAddress?.trim() || null,

          taxIdentificationName: record.taxIdentificationName?.trim() || null,
          taxIdentificationValue: record.taxIdentificationValue ?? null,
          taxIdentificationNumber:
            record.taxIdentificationNumber?.trim() || null,

          isPoWhatsapp: record.isPoWhatsapp ?? false,
          isPoEmail: record.isPoEmail ?? false,
          isPoSms: record.isPoSms ?? false,
          isGrnWhatsapp: record.isGrnWhatsapp ?? false,
          isGrnEmail: record.isGrnEmail ?? false,
          isGrnSms: record.isGrnSms ?? false,
          isReturnWhatsapp: record.isReturnWhatsapp ?? false,
          isReturnEmail: record.isReturnEmail ?? false,
          isReturnSms: record.isReturnSms ?? false,

          batchJobId: batchJob.id,
        }),
      );

      await tx.invItemSupplierExcel.createMany({
        data: rows,
      });

      logger.info("exiting::createItemSupplierExcelInDb::repository");

      return batchJob;
    },
    {
      timeout: API_TIMEOUT,
    },
  );
};

export async function ItemSupplierBatchJob(input: ItemSupplierBatchJobInput) {
  const { batchJobId } = input;

  let skip = 0;
  let isDone = false;

  const store = requestStorage.getStore();
  const BATCH_SIZE = store?.settings?.batchSize || 100;

  await db.batchJob.update({
    where: { id: batchJobId },
    data: { status: "IN_PROGRESS" },
  });

  while (!isDone) {
    const batch = await db.invItemSupplierExcel.findMany({
      where: { batchJobId },
      orderBy: { rowNo: "asc" },
      skip,
      take: BATCH_SIZE,
    });

    if (batch.length === 0) {
      isDone = true;
      break;
    }

    for (const row of batch) {
      try {
        const supplierReq = mapExcelRowToItemSupplierReq(row);

        await createItemSupplierServiceValidation(supplierReq);

        const created = await createItemSupplierInDb(supplierReq);

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            refId: created.id,
            refNo: created.supplierCode ?? String(created.id),
            rowTitle: created.vendorCompanyName,
            status: "SUCCESS",
            rowNo: row.rowNo,
          },
        });

        await db.batchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            successCount: { increment: 1 },
            status: "IN_PROGRESS",
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : typeof error === "string"
              ? error
              : "Unknown error";

        await db.batchJobDetails.create({
          data: {
            batchId: batchJobId,
            rowTitle: row.vendorCompanyName,
            refNo: row.supplierCode ?? String(row.rowNo),
            status: "FAILED",
            rowNo: row.rowNo,
            errorMsg: `${row.vendorCompanyName} ---> ${errorMessage}`,
          },
        });

        await db.batchJob.update({
          where: { id: batchJobId },
          data: {
            processedQty: { increment: 1 },
            failureCount: { increment: 1 },
          },
        });
      }
    }

    skip += BATCH_SIZE;
  }

  const batchInfo = await db.batchJob.findUnique({
    where: { id: batchJobId },
  });

  await db.invItemSupplierExcel.deleteMany({
    where: { batchJobId },
  });

  if (batchInfo && batchInfo.totalQty === batchInfo.processedQty) {
    await db.batchJob.update({
      where: { id: batchJobId },
      data: { status: "COMPLETED" },
    });
  }

  await initializeCache();
}

export async function searchItemSuppliersFromDb(
  type: ItemSupplierSearchType,
  searchText: string,
): Promise<ItemSupplierLookupRow[]> {
  logger.info("entering::searchItemSuppliersFromDb::repository");

  const search = searchText.trim();

  if (!search) {
    logger.info("exiting::searchItemSuppliersFromDb::repository");
    return [];
  }

  const containsFilter = { contains: search };

  const where: Prisma.InvItemSupplierWhereInput = {
    isActive: true,
    deletedAt: null,
  };

  switch (type) {
    case ItemSupplierSearchType.CODE:
      where.supplierCode = containsFilter;
      break;

    case ItemSupplierSearchType.NAME:
      where.vendorCompanyName = containsFilter;
      break;

    case ItemSupplierSearchType.EMAIL:
      where.email = containsFilter;
      break;

    case ItemSupplierSearchType.PHONE:
      where.phone = containsFilter;
      break;

    default:
      logger.info("exiting::searchItemSuppliersFromDb::repository");
      return [];
  }

  const itemSuppliers = await db.invItemSupplier.findMany({
    where,
    select: {
      id: true,
      supplierCode: true,
      vendorCompanyName: true,
      email: true,
      phone: true,
    },
    orderBy: {
      vendorCompanyName: "asc",
    },
  });

  logger.info("exiting::searchItemSuppliersFromDb::repository");
  return itemSuppliers;
}
